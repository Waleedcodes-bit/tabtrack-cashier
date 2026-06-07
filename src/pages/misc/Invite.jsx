import React, { useState, useEffect } from 'react';
import { Share2, Smartphone, Copy, Check, Loader } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';

const Invite = () => {
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('code')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.code) {
          setInviteLink(`https://navoq.app/join/${data.code}`);
        }
      } catch (err) {
        console.error('Failed to fetch invite code:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, []);

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainLayout title="Invite Customers" showBack>
      <div className="max-w-2xl">

        {/* Hero Card */}
        <div
          className="rounded-3xl p-6 mb-4 relative overflow-hidden text-center"
          style={{ background: 'linear-gradient(145deg, #0f2347 0%, #0a3328 50%, #0f4d3a 100%)', boxShadow: '0 16px 48px rgba(10,22,40,0.15)' }}
        >
          <div className="absolute top-0 left-6 right-6 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
          <div className="absolute -top-8 left-1/2 w-40 h-40 rounded-full pointer-events-none -translate-x-1/2"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.12), transparent 70%)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Smartphone size={30} className="text-white" />
            </div>
            <h2 className="text-lg font-black text-white mb-1.5">Grow Your Book</h2>
            <p className="text-sm text-white/50 font-medium leading-relaxed px-4">
              Share your unique link — customers install the app and link directly to your restaurant.
            </p>
          </div>
        </div>

        {/* Link Card */}
        <div className="bg-white dark:bg-white/5 rounded-3xl p-5 mb-3 border border-gray-100 dark:border-white/10">
          <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3">
            Your Unique Invite Link
          </p>

          <div className="px-4 py-3.5 rounded-2xl mb-3 flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader size={14} className="text-gray-400 animate-spin" />
                <p className="text-sm font-mono text-gray-400 dark:text-white/30">Loading your link…</p>
              </div>
            ) : (
              <p className="text-sm font-mono text-gray-500 dark:text-white/50 truncate">
                {inviteLink || 'No invite code assigned'}
              </p>
            )}
            <button
              onClick={handleCopy}
              disabled={!inviteLink || loading}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
              style={{ backgroundColor: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)' }}
            >
              {copied
                ? <Check size={14} className="text-emerald-400" />
                : <Copy size={14} className="text-gray-400 dark:text-white/40" />}
            </button>
          </div>

          <button
            onClick={handleCopy}
            disabled={!inviteLink || loading}
            className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              background: copied
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #0f2347 0%, #0a3328 50%, #0f4d3a 100%)',
              boxShadow: copied ? '0 6px 20px rgba(5,150,105,0.2)' : '0 6px 20px rgba(15,35,71,0.15)',
              transition: 'all 0.3s ease',
            }}
          >
            {copied ? <Check size={17} /> : <Share2 size={17} />}
            {copied ? 'Link Copied!' : 'Copy & Share Link'}
          </button>
        </div>

        {/* Tip */}
        <div className="flex gap-3 items-start p-4 rounded-2xl"
          style={{ backgroundColor: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black mt-0.5"
            style={{ background: 'linear-gradient(135deg, #0f2347 0%, #0f4d3a 100%)' }}>!</div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
            <strong>Tip:</strong> Tell customers to tap <strong>"Add to Home Screen"</strong> in
            their browser after opening the link to install the app.
          </p>
        </div>

      </div>
    </MainLayout>
  );
};

export default Invite;