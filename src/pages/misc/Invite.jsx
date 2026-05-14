import React, { useState } from 'react';
import { Share2, Smartphone, Copy, Check } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

const INVITE_LINK = 'https://tabtrack.app/join/rest_001';

const Invite = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(INVITE_LINK).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainLayout title="Invite Customers" showBack>
      <div className="max-w-2xl">

        {/* Hero Card */}
        <div
          className="rounded-3xl p-6 mb-4 relative overflow-hidden text-center"
          style={{
            background: 'linear-gradient(145deg, #0f2347 0%, #1a3565 100%)',
            boxShadow: '0 16px 48px rgba(10,22,40,0.15)',
          }}
        >
          <div
            className="absolute top-0 left-6 right-6 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
          />
          <div
            className="absolute -top-8 left-1/2 w-40 h-40 rounded-full pointer-events-none -translate-x-1/2"
            style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.15), transparent 70%)' }}
          />

          <div className="relative z-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Smartphone size={30} className="text-white" />
            </div>
            <h2 className="text-lg font-black text-white mb-1.5">Grow Your Book</h2>
            <p className="text-xs text-white/40 font-semibold leading-relaxed px-4">
              Share your unique link — customers install the app and link directly to your restaurant.
            </p>
          </div>
        </div>

        {/* Link Card */}
        <div
          className="bg-white rounded-3xl p-5 mb-3"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}
        >
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Your Unique Invite Link
          </p>

          {/* Link Display */}
          <div
            className="px-4 py-3.5 rounded-2xl mb-3 flex items-center justify-between gap-3"
            style={{ backgroundColor: '#f8fafc', border: '1px dashed rgba(15,35,71,0.15)' }}
          >
            <p className="text-xs font-mono text-gray-500 truncate">{INVITE_LINK}</p>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ backgroundColor: copied ? '#dcfce7' : '#f0f4f8' }}
            >
              {copied
                ? <Check size={14} className="text-green-600" />
                : <Copy size={14} className="text-[#0f2347]" />
              }
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleCopy}
            className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: copied
                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                : 'linear-gradient(135deg, #0f2347 0%, #1a3565 100%)',
              boxShadow: copied
                ? '0 6px 20px rgba(22,163,74,0.2)'
                : '0 6px 20px rgba(15,35,71,0.15)',
              transition: 'all 0.3s ease',
            }}
          >
            {copied ? <Check size={17} /> : <Share2 size={17} />}
            {copied ? 'Link Copied!' : 'Copy & Share Link'}
          </button>
        </div>

        {/* Tip */}
        <div
          className="flex gap-3 items-start p-4 rounded-2xl"
          style={{ backgroundColor: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.1)' }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black mt-0.5"
            style={{ backgroundColor: '#ea580c' }}
          >
            !
          </div>
          <p className="text-xs text-orange-700 leading-relaxed font-medium">
            <strong>Tip:</strong> Tell customers to tap <strong>"Add to Home Screen"</strong> in
            their browser after opening the link to install the app.
          </p>
        </div>

      </div>
    </MainLayout>
  );
};

export default Invite;