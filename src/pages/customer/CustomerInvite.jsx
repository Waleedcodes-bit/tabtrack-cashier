import React, { useState, useEffect } from 'react';
import { Share2, User, Copy, Check } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { supabase } from '../../lib/supabase';

const CustomerInvite = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customerCode, setCustomerCode] = useState('');
  const [loading, setLoading] = useState(true);

  // ── Fetch the logged-in customer's code from profiles ─────────────────────
  useEffect(() => {
    const fetchCode = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('code')
        .eq('id', user.id)
        .single();

      if (error) { console.error('fetchCode:', error); setLoading(false); return; }

      setCustomerCode(profile?.code || '');
      setLoading(false);
    };

    fetchCode();
  }, []);

  const inviteLink = customerCode
    ? `https://navoq.app/join/${customerCode.toLowerCase().replace('-', '')}`
    : '';

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!customerCode) return;
    navigator.clipboard.writeText(customerCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <CustomerLayout title="Share Code" showBack>
      <div className="max-w-2xl">

        {/* Hero Card */}
        <div
          className="rounded-3xl p-6 mb-4 relative overflow-hidden text-center"
          style={{ background: 'linear-gradient(145deg, #0d2137 0%, #0a3328 50%, #0f4d3a 100%)', boxShadow: '0 16px 48px rgba(10,33,55,0.25)' }}
        >
          <div className="absolute top-0 left-6 right-6 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
          <div className="absolute -top-8 left-1/2 w-40 h-40 rounded-full pointer-events-none -translate-x-1/2"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.12), transparent 70%)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <User size={30} className="text-white" />
            </div>
            <h2 className="text-lg font-black text-white mb-1.5">Your Customer Code</h2>
            <p className="text-sm text-white/50 font-medium leading-relaxed px-4">
              Share your code or link with a restaurant so they can add you as a debtor instantly.
            </p>
          </div>
        </div>

        {/* Code Card */}
        <div className="bg-white dark:bg-white/5 rounded-3xl p-5 mb-3 border border-gray-100 dark:border-white/10">
          <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3">
            Your Customer Code
          </p>

          <div className="px-4 py-5 rounded-2xl mb-3 flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
            {loading ? (
              <p className="text-2xl font-black text-gray-300 dark:text-white/20 tracking-widest">Loading…</p>
            ) : customerCode ? (
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-widest">{customerCode}</p>
            ) : (
              <p className="text-sm font-bold text-gray-400 dark:text-white/30">No code assigned yet</p>
            )}
            <button
              onClick={handleCopyCode}
              disabled={!customerCode || loading}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
              style={{ backgroundColor: copiedCode ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)' }}
            >
              {copiedCode
                ? <Check size={15} className="text-emerald-400" />
                : <Copy size={15} className="text-gray-400 dark:text-white/40" />}
            </button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/10" />
            <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">or share link</p>
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/10" />
          </div>

          <div className="px-4 py-3.5 rounded-2xl mb-3 flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
            <p className="text-sm font-mono text-gray-500 dark:text-white/40 truncate">
              {loading ? 'Loading…' : inviteLink || 'No link available'}
            </p>
            <button
              onClick={handleCopyLink}
              disabled={!inviteLink || loading}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
              style={{ backgroundColor: copiedLink ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)' }}
            >
              {copiedLink
                ? <Check size={14} className="text-emerald-400" />
                : <Copy size={14} className="text-gray-400 dark:text-white/40" />}
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            disabled={!inviteLink || loading}
            className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              background: copiedLink
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(145deg, #0d2137 0%, #0a3328 50%, #0f4d3a 100%)',
              boxShadow: copiedLink ? '0 6px 20px rgba(5,150,105,0.2)' : '0 6px 20px rgba(13,33,55,0.2)',
              transition: 'all 0.3s ease',
            }}
          >
            {copiedLink ? <Check size={17} /> : <Share2 size={17} />}
            {copiedLink ? 'Link Copied!' : 'Copy & Share Link'}
          </button>
        </div>

        {/* Tip */}
        <div className="flex gap-3 items-start p-4 rounded-2xl"
          style={{ backgroundColor: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black mt-0.5"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>!</div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
            <strong>Tip:</strong> Give your code to the cashier directly, or share the link so they can add you as a debtor without you being present.
          </p>
        </div>

      </div>
    </CustomerLayout>
  );
};

export default CustomerInvite;