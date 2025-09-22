import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, customerId, referralCode } = body;

    // Placeholder Stripe checkout session
    const mockSession = {
      id: `cs_test_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/cs_test_${Date.now()}#placeholder`,
      payment_status: 'unpaid',
      status: 'open',
      customer: customerId || `cus_placeholder_${Date.now()}`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        referralCode: referralCode || '',
      },
    };

    return NextResponse.json({
      sessionId: mockSession.id,
      url: mockSession.url,
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}