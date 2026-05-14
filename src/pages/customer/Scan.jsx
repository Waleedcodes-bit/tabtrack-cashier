import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, UserPlus, Store } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { formatZAR } from '../../utils/format';

// ─── Mock data ────────────────────────────────────────────────────────────────
// In production: restaurant comes from decoding the QR payload (e.g. a URL with ?restaurantId=...)
const SCANNED_RESTAURANT = { id: '1', name: 'The Corner Bistro', code: 'TCB-001' };

// In production: check against the logged-in customer's linked restaurants from your DB/context
const IS_EXISTING_DEBTOR = false; // flip to true to test the "already linked" flow

const Scan = () => {
  const navigate = useNavigate();

  // Step: 'scan' → 'gate' (not a debtor) OR 'order' (already a debtor) → 'submitted'
  const [step, setStep]         = useState('scan');
  const [orderName, setOrderName] = useState('');
  const [amount, setAmount]     = useState('');

  const today     = new Date().toISOString().split('T')[0];
  const canSubmit = orderName && amount;

  const handleScan = () => {
    // In production: decode QR, fetch restaurant, check debtor status
    if (IS_EXISTING_DEBTOR) {
      setStep('order');
    } else {
      setStep('gate');
    }
  };

  const handleSubmit = () => setStep('submitted');

  // ── 1. Scan Screen ──────────────────────────────────────────────────────────
  if (step === 'scan') {
    return (
      <CustomerLayout title="Scan QR Code" showBack>
        <div className="flex flex-col items-center justify-center py-8">

          {/* QR Viewfinder */}
          <div
            className="w-64 h-64 rounded-3xl flex items-center justify-center mb-8 relative"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
          >
            {[
              'top-4 left-4 border-t-2 border-l-2 rounded-tl-xl',
              'top-4 right-4 border-t-2 border-r-2 rounded-tr-xl',
              'bottom-4 left-4 border-b-2 border-l-2 rounded-bl-xl',
              'bottom-4 right-4 border-b-2 border-r-2 rounded-br-xl',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-8 h-8 border-white/40 ${cls}`} />
            ))}
            <QrCode size={80} className="text-white/30" />
          </div>

          <p className="text-sm font-medium text-gray-500 text-center mb-1">
            Point your camera at the restaurant's QR code
          </p>
          <p className="text-xs text-gray-400 font-medium text-center mb-10">
            The QR code is on the wall at your restaurant
          </p>

          <button
            onClick={handleScan}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm active:scale-[0.98] transition-all"
            style={{
              background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)',
              boxShadow: '0 6px 20px rgba(13,33,55,0.2)',
            }}
          >
            Simulate Scan (Dev Only)
          </button>
        </div>
      </CustomerLayout>
    );
  }

  // ── 2. Gate Screen — not yet a debtor at this restaurant ───────────────────
  if (step === 'gate') {
    return (
      <CustomerLayout title="Register to Restaurant" showBack>
        <div className="flex flex-col items-center py-10 text-center">

          {/* Restaurant pill */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(13,33,55,0.06)', border: '1px solid rgba(13,33,55,0.08)' }}
          >
            <Store size={13} className="text-[#0d2137]" />
            <span className="text-xs font-black text-[#0d2137] tracking-wide">
              {SCANNED_RESTAURANT.name}
            </span>
          </div>

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
          >
            <UserPlus size={32} className="text-white" />
          </div>

          <h2 className="text-xl font-black text-gray-900 mb-2">
            Not registered here yet
          </h2>
          <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs">
            You need to register with <span className="font-bold text-gray-600">{SCANNED_RESTAURANT.name}</span> before
            you can log orders on credit.
          </p>

          {/* Divider */}
          <div className="w-full my-8 border-t border-gray-100" />

          {/* What happens next */}
          <div className="w-full space-y-3 mb-8 text-left">
            {[
              { step: '1', text: 'Create your account (takes 30 seconds)' },
              { step: '2', text: 'You\'re automatically added as a debtor' },
              { step: '3', text: 'The cashier gets notified instantly' },
              { step: '4', text: 'Log your first order right away' },
            ].map(({ step: s, text }) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
                >
                  {s}
                </div>
                <p className="text-xs font-semibold text-gray-600">{text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/customer/auth', {
              state: { fromQR: true, restaurant: SCANNED_RESTAURANT },
            })}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm active:scale-[0.98] transition-all"
            style={{
              background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)',
              boxShadow: '0 6px 20px rgba(13,33,55,0.2)',
            }}
          >
            Register to {SCANNED_RESTAURANT.name}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="mt-3 w-full py-3 rounded-2xl font-bold text-gray-400 text-sm bg-gray-50 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        </div>
      </CustomerLayout>
    );
  }

  // ── 3. Order Entry Screen — restaurant pre-filled from QR ──────────────────
  if (step === 'order') {
    return (
      <CustomerLayout title="Log Order" showBack>
        <div className="space-y-4">

          {/* Restaurant + Date banner */}
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
          >
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">
              Logging order at
            </p>
            <p className="text-base font-black text-white">{SCANNED_RESTAURANT.name}</p>
            <p className="text-xs text-white/50 font-medium mt-1">Today — {today}</p>
          </div>

          {/* Order Description */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">
              Order Description
            </label>
            <input
              type="text"
              value={orderName}
              onChange={e => setOrderName(e.target.value)}
              placeholder="e.g. Burger & Fries"
              className="w-full px-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">
              Amount (ZAR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-5 py-5 bg-white rounded-2xl border border-gray-100 outline-none text-2xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-gray-200"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] mt-2
              ${canSubmit
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Submit Order
          </button>

          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Show the confirmation screen to your cashier
          </p>
        </div>
      </CustomerLayout>
    );
  }

  // ── 4. Submitted Screen ────────────────────────────────────────────────────
  return (
    <CustomerLayout title="Order Submitted" showBack>
      <div className="flex flex-col items-center justify-center py-16 text-center">

        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-5 border border-green-100">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-black">✓</span>
          </div>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Order Logged!</h2>
        <p className="text-sm text-gray-400 font-medium">
          Show this screen to the cashier to confirm.
        </p>

        {/* Order Summary Card */}
        <div
          className="mt-8 w-full rounded-2xl p-6 text-left"
          style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
        >
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Order Summary</p>
          <p className="text-3xl font-black text-white mb-5">{formatZAR(parseFloat(amount))}</p>
          <div
            className="rounded-2xl px-4 py-3 space-y-2.5"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {[
              { label: 'Item',       value: orderName },
              { label: 'Restaurant', value: SCANNED_RESTAURANT.name },
              { label: 'Date',       value: today },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-white/40 font-medium">{label}</span>
                <span className="text-xs text-white font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/customer/dashboard')}
          className="mt-6 w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-600 active:scale-[0.98] transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </CustomerLayout>
  );
};

export default Scan;