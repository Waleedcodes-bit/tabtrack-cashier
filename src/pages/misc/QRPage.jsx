import React, { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Share2, Mail, MessageCircle, Link2, Check, X, Download, Loader } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';

/* ─── helpers ─── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const QRPage = () => {
  const hiddenQrRef = useRef(null);
  const [showSheet, setShowSheet] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [profile, setProfile]     = useState({ businessName: '', qrValue: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('code, business_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile({
          businessName: data.business_name || 'My Restaurant',
          qrValue: data.code || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* Build the shareable image canvas */
  const buildCanvas = () => {
    const qrCanvas = hiddenQrRef.current?.querySelector('canvas');
    if (!qrCanvas) return null;

    const W = 640, H = 760;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#0d2137');
    grad.addColorStop(0.5, '#0a3328');
    grad.addColorStop(1,   '#0f4d3a');
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, W, H, 48);
    ctx.fill();

    const glow = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, W * 0.55);
    glow.addColorStop(0, 'rgba(79,142,247,0.09)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const pad = 72, qrSize = W - pad * 2;
    const cardY = 80;
    ctx.fillStyle = 'white';
    roundRect(ctx, pad - 28, cardY - 28, qrSize + 56, qrSize + 56, 32);
    ctx.fill();

    ctx.drawImage(qrCanvas, pad, cardY, qrSize, qrSize);

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(profile.businessName, W / 2, cardY + qrSize + 56 + 62);

    ctx.fillStyle = 'rgba(52,211,153,0.75)';
    ctx.font = '500 19px sans-serif';
    ctx.fillText('Scan to open a tab · Navoq', W / 2, cardY + qrSize + 56 + 104);

    return c;
  };

  const getBlob = () =>
    new Promise(resolve => {
      const c = buildCanvas();
      if (!c) return resolve(null);
      c.toBlob(resolve, 'image/png');
    });

  const handleShare = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], `${profile.businessName}-qr.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `${profile.businessName} QR Code`,
          text: `Scan to open a credit tab at ${profile.businessName}`,
          files: [file],
        });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    setShowSheet(true);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Scan this QR code to open a credit tab at ${profile.businessName}:\n${profile.qrValue}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${profile.businessName} — Tab QR Code`);
    const body    = encodeURIComponent(
      `Hi,\n\nScan or tap the link below to open a credit tab at ${profile.businessName}.\n\n${profile.qrValue}\n\nPowered by Navoq`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDownload = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `${profile.businessName}-qr.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!profile.qrValue) return;
    await navigator.clipboard.writeText(profile.qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainLayout title="Restaurant QR" showBack>
      <div className="max-w-sm mx-auto flex flex-col items-center">

        <p className="text-sm text-gray-400 font-medium mb-8 text-center px-2">
          Customers scan this to link their account and log credit orders.
        </p>

        {/* ── QR Display Card ── */}
        <div
          className="w-full rounded-3xl p-8 flex flex-col items-center relative overflow-hidden mb-6"
          style={{
            background: 'linear-gradient(145deg, #0d2137 0%, #0a3328 50%, #0f4d3a 100%)',
            boxShadow: '0 20px 60px rgba(10,33,55,0.35)',
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.1), transparent 70%)' }}
          />
          <div
            className="absolute top-0 left-8 right-8 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
          />

          {/* White QR box */}
          <div
            className="bg-white rounded-2xl p-5 relative z-10 mb-5 flex items-center justify-center"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)', minWidth: 220, minHeight: 220 }}
          >
            {loading ? (
              <Loader size={32} className="text-gray-300 animate-spin" />
            ) : profile.qrValue ? (
              <QRCodeCanvas
                value={profile.qrValue}
                size={210}
                bgColor="#ffffff"
                fgColor="#0d1321"
                level="H"
                includeMargin={false}
              />
            ) : (
              <p className="text-xs text-gray-400 text-center px-4">No QR code available — contact support</p>
            )}
          </div>

          {/* Business name */}
          <p className="text-white font-black text-lg tracking-tight font-['Plus_Jakarta_Sans'] relative z-10">
            {loading ? '…' : profile.businessName}
          </p>
          <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">
            Scan to open a tab
          </p>
        </div>

        {/* ── Share Button ── */}
        <button
          onClick={handleShare}
          disabled={loading || !profile.qrValue}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0f2347, #0a3328)' }}
        >
          <Share2 size={17} />
          Share QR Code
        </button>

      </div>

      {/* ── Share Sheet (fallback) ── */}
      {showSheet && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSheet(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10"
            style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <p className="font-black text-gray-900 text-base font-['Plus_Jakarta_Sans']">Share via</p>
              <button
                onClick={() => setShowSheet(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={15} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">

              {/* WhatsApp */}
              <button
                onClick={() => { handleWhatsApp(); setShowSheet(false); }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#25D366' }}>
                  <MessageCircle size={22} className="text-white" />
                </div>
                <span className="text-[11px] font-bold text-gray-700">WhatsApp</span>
              </button>

              {/* Email */}
              <button
                onClick={() => { handleEmail(); setShowSheet(false); }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500">
                  <Mail size={22} className="text-white" />
                </div>
                <span className="text-[11px] font-bold text-gray-700">Email</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-95"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${copied ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  {copied
                    ? <Check size={22} className="text-white" />
                    : <Link2 size={22} className="text-gray-500" />
                  }
                </div>
                <span className="text-[11px] font-bold text-gray-700">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

            </div>

            {/* Save image */}
            <button
              onClick={() => { handleDownload(); setShowSheet(false); }}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #0f2347, #0a3328)', color: 'white' }}
            >
              <Download size={16} /> Save Image
            </button>
          </div>
        </>
      )}

      {/* Hidden high-res QR for canvas export */}
      <div ref={hiddenQrRef} className="hidden" aria-hidden="true">
        {!loading && profile.qrValue && (
          <QRCodeCanvas value={profile.qrValue} size={500} bgColor="#ffffff" fgColor="#0d1321" level="H" />
        )}
      </div>
    </MainLayout>
  );
};

export default QRPage;