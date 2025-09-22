import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, referralCode } = body;

    const supabase = await createServerSupabaseClient();

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          referral_code: referralCode,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          email: email,
          full_name: fullName,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Handle referral if code provided
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('referral_code', referralCode)
          .single();

        if (referrer) {
          await supabase.from('referrals').insert({
            referrer_id: referrer.user_id,
            referred_id: authData.user.id,
            status: 'pending',
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Check your email to confirm your account',
      user: authData.user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}