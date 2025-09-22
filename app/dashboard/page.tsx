'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Users, Eye, Globe, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsData {
  visitors: number;
  pageViews: number;
  avgDuration: string;
  topPages: { path: string; views: number }[];
  countries: { country: string; visitors: number }[];
  trend: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchAnalytics();
    fetchSubscription();
  }, []);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    setUser(user);
  }

  async function fetchAnalytics() {
    // Mock analytics data - in production, fetch from API
    setAnalytics({
      visitors: 1234,
      pageViews: 5678,
      avgDuration: '2m 34s',
      topPages: [
        { path: '/', views: 2345 },
        { path: '/pricing', views: 1234 },
        { path: '/services', views: 987 },
        { path: '/about', views: 654 },
        { path: '/contact', views: 458 },
      ],
      countries: [
        { country: 'United Kingdom', visitors: 567 },
        { country: 'Vietnam', visitors: 234 },
        { country: 'Germany', visitors: 189 },
        { country: 'France', visitors: 156 },
        { country: 'Netherlands', visitors: 88 },
      ],
      trend: 12.5,
    });
    setLoading(false);
  }

  async function fetchSubscription() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setSubscription(data);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your website performance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-[var(--accent-cyan)]" />
              <span className="text-green-500 text-sm font-medium">+{analytics?.trend}%</span>
            </div>
            <div className="text-2xl font-bold text-white">{analytics?.visitors.toLocaleString()}</div>
            <div className="text-gray-400 text-sm mt-1">Total Visitors</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-[var(--accent-purple)]" />
              <span className="text-green-500 text-sm font-medium">+8.3%</span>
            </div>
            <div className="text-2xl font-bold text-white">{analytics?.pageViews.toLocaleString()}</div>
            <div className="text-gray-400 text-sm mt-1">Page Views</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-[var(--accent-pink)]" />
              <span className="text-gray-400 text-sm">Avg</span>
            </div>
            <div className="text-2xl font-bold text-white">{analytics?.avgDuration}</div>
            <div className="text-gray-400 text-sm mt-1">Avg. Duration</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-green-500 text-sm font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {subscription?.status === 'active' ? 'Active' : 'Inactive'}
            </div>
            <div className="text-gray-400 text-sm mt-1">Subscription</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart className="w-5 h-5 text-[var(--accent-cyan)]" />
              <h2 className="text-lg font-semibold text-white">Top Pages</h2>
            </div>
            <div className="space-y-3">
              {analytics?.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                    <span className="text-white">{page.path}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[var(--bg-tertiary)] rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] h-2 rounded-full"
                        style={{ width: `${(page.views / (analytics?.topPages[0].views || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-16 text-right">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-[var(--accent-purple)]" />
              <h2 className="text-lg font-semibold text-white">Top Countries</h2>
            </div>
            <div className="space-y-3">
              {analytics?.countries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                    <span className="text-white">{country.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[var(--bg-tertiary)] rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] h-2 rounded-full"
                        style={{ width: `${(country.visitors / (analytics?.countries[0].visitors || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-16 text-right">
                      {country.visitors.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-[var(--bg-secondary)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/dashboard/membership')}
              className="px-4 py-3 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              Manage Membership
            </button>
            <button 
              onClick={() => router.push('/dashboard/referrals')}
              className="px-4 py-3 bg-[var(--bg-tertiary)] rounded-lg text-white font-medium hover:bg-[var(--border-primary)] transition-colors"
            >
              View Referrals
            </button>
            <button 
              onClick={() => router.push('/dashboard/support')}
              className="px-4 py-3 bg-[var(--bg-tertiary)] rounded-lg text-white font-medium hover:bg-[var(--border-primary)] transition-colors"
            >
              Get Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}