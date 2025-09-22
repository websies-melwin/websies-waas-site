'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Copy, Check, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingCommission: 0,
    paidCommission: 0,
  });
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    fetchReferralData();
  }, []);

  async function fetchReferralData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user profile with referral code
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setReferralCode(profile.referral_code || generateReferralCode());
      }

      // Get referrals
      const { data: referralData } = await supabase
        .from('referrals')
        .select('*, referred:referred_id(email, created_at)')
        .eq('referrer_id', user.id);
      
      if (referralData) {
        setReferrals(referralData);
        
        // Calculate stats
        const active = referralData.filter(r => r.status === 'active').length;
        const pending = referralData
          .filter(r => r.status === 'pending')
          .reduce((sum, r) => sum + (r.commission_amount || 47), 0);
        const paid = referralData
          .filter(r => r.status === 'paid')
          .reduce((sum, r) => sum + (r.commission_amount || 47), 0);
        
        setStats({
          totalReferrals: referralData.length,
          activeReferrals: active,
          pendingCommission: pending,
          paidCommission: paid,
        });
      }
    }
  }

  function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async function copyReferralLink() {
    const link = `${window.location.origin}/?ref=${referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-gray-400">Earn 100% commission on your first month for each referral!</p>
        </div>

        {/* Referral Link */}
        <div className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Your Referral Link</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur rounded-lg px-4 py-3">
              <code className="text-white font-mono text-sm">
                {window.location.origin}/?ref={referralCode}
              </code>
            </div>
            <button
              onClick={copyReferralLink}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-[var(--accent-cyan)]" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
            <div className="text-gray-400 text-sm mt-1">Total Referrals</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.activeReferrals}</div>
            <div className="text-gray-400 text-sm mt-1">Active Subscriptions</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-white">£{stats.pendingCommission}</div>
            <div className="text-gray-400 text-sm mt-1">Pending Commission</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">£{stats.paidCommission}</div>
            <div className="text-gray-400 text-sm mt-1">Paid Commission</div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Your Referrals</h2>
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-4">Email</th>
                    <th className="pb-4">Joined</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Commission</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-t border-[var(--border-primary)]">
                      <td className="py-4">{referral.referred?.email || 'Unknown'}</td>
                      <td className="py-4">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          referral.status === 'active' ? 'bg-green-500/20 text-green-500' :
                          referral.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-4">£{referral.commission_amount || 47}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No referrals yet</p>
              <p className="text-sm text-gray-500">
                Share your referral link to start earning commissions!
              </p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-[var(--bg-secondary)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">How It Works</h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--accent-cyan)] rounded-full flex items-center justify-center text-white font-bold">1</div>
              <div>
                <h3 className="font-medium text-white mb-1">Share Your Link</h3>
                <p className="text-sm">Share your unique referral link with friends and colleagues</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--accent-purple)] rounded-full flex items-center justify-center text-white font-bold">2</div>
              <div>
                <h3 className="font-medium text-white mb-1">They Sign Up</h3>
                <p className="text-sm">When someone signs up using your link and subscribes</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--accent-pink)] rounded-full flex items-center justify-center text-white font-bold">3</div>
              <div>
                <h3 className="font-medium text-white mb-1">Earn Commission</h3>
                <p className="text-sm">You earn 100% of their first month's subscription (£47)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}