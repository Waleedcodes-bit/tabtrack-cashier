import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, UserPlus, Store, X, CheckCircle, ShieldX } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { formatZAR } from '../../utils/format';
import { addNotification } from '../../store/notificationStore';

const ALL_RESTAURANTS = [
  { id: '1', name: 'The Corner Bistro', code: 'TCB-001' },
  { id: '2', name: 'The Green Bistro',  code: 'TGB-002' },
  { id: '3', name: 'Nando\'s Hatfield', code: 'NH-003'  },
];

const LINKED_RESTAURANT_IDS = ['1', '2'];
const SCANNED_RESTAURANT = ALL_RESTAURANTS[0]; // linked restaurant for testing block
const isLinked = LINKED_RESTAURANT_IDS.includes(SCANNED_RESTAURANT.id);

// Simulate current customer's block status — in production comes from auth context
const CURRENT_CUSTOMER = {
  name: 'John Doe',
  unsettledPreviousMonth: true,
  previousMonthBalance: 210.00,
};

const Scan = () => {
  const navigate = useNavigate();

  const [step, setStep]               = useState('scan'); // scan | blocked | confirm | order | submitted
  const [showDeclined, setShowDeclined] = useState(false);
  const [orderName, setOrderName]     = useState('');
  const [amount, setAmount]           = useState('');

  const today     = new Date().toISOString().split('T')[0];
  const canSubmit = orderName.trim() && amount;

  const handleScan = () => {
    if (!isLinked) {
      setStep('confirm');
      return;
    }
    // Block check — only for linked customers
    if (CURRENT_CUSTOMER.unsettledPreviousMonth) {
      setStep('blocked');
      return;
    }
    setStep('order');
  };

  const handleAccept = () => {
    // New registrations are never blocked (no previous month)
    setStep('order');
  };

  const handleDecline = () => {
    setShowDeclined(true);
    setTimeout(() => navigate('/customer/dashboard'), 2000);
  };

  const handleSubmit = () => {
    addNotification({
      type: 'order',
      title: 'New order submitted',
      body: `${orderName} — logged by customer via QR`,
      amount: `R ${parseFloat(amount).toFixed(2).replace('.', ',')}`,
    });
    setStep('submitted');
  };

  // ── 1. Scan ─────────────────────────────────────────────────────────────────
  if (step === 'scan') {
    return (
      <CustomerLayout title="Scan QR Code" showBack>
        <div className="flex flex-col items-center justify-center py-8">
          <div
            className="w-64 h-64 rounded-3xl flex items-center justify-center mb-8 relative"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
          >
            {['top-4 left-4 border-t-2 border-l-2 rounded-tl-xl','top-4 right-4 border-t-2 border-r-2 rounded-tr-xl','bottom-4 left-4 border-b-2 border-l-2 rounded-bl-xl','bottom-4 right-4 border-b-2 border-r-2 rounded-br-xl'].map((cls, i) => (
              <div key={i} className={`absolute w-8 h-8 border-white/40 ${cls}`} />
            ))}
            <QrCode size={80} className="text-white/30" />
          </div>
          <p className="text-sm font-medium text-gray-500 text-center mb-1">
            Point your camera at the restaurant's QR code
          </p>
          <p className="text-xs text-gray-400 font-medium text-center mb-10">
            The QR code is displayed at the restaurant
          </p>
          <button
            onClick={handleScan}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)', boxShadow: '0 6px 20px rgba(13,33,55,0.2)' }}
          >
            Simulate Scan (Dev Only)
          </button>
        </div>
      </CustomerLayout>
    );
  }

  // ── 2. Blocked ───────────────────────────────────────────────────────────────
  if (step === 'blocked') {
    return (
      <CustomerLayout title="Account Blocked" showBack>
        <div className="flex flex-col items-center justify-center py-10 text-center px-2">

          <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6">
            <ShieldX size={36} className="text-red-500" />
          </div>

          <h2 className="text-xl font-black text-gray-900 mb-2">Account Blocked</h2>
          <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs mb-6">
            Your account has an unsettled balance of{' '}
            <span className="font-black text-red-500">
              {formatZAR(CURRENT_CUSTOMER.previousMonthBalance)}
            </span>{' '}
            from last month. You cannot add new orders until this is settled.
          </p>

          <div
            className="w-full rounded-2xl px-5 py-4 mb-8 border border-red-100"
            style={{ backgroundColor: 'rgba(239,68,68,0.05)' }}
          >
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">What to do</p>
            <p className="text-sm text-red-600 font-medium leading-relaxed">
              Please speak to the cashier to settle your previous month's balance before placing new orders.
            </p>
          </div>

          <button
            onClick={() => navigate('/customer/dashboard')}
            className="w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-600 active:scale-[0.98] transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </CustomerLayout>
    );
  }

  // ── 3. Registration Prompt ───────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <CustomerLayout title="New Restaurant" showBack>
        <div className="flex flex-col items-center py-10 text-center px-2">
          {showDeclined && (
            <div className="fixed top-6 left-4 right-4 z-50 bg-gray-900 text-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl">
              <X size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-sm font-semibold">Registration declined. Returning home…</p>
            </div>
          )}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(13,33,55,0.06)', border: '1px solid rgba(13,33,55,0.08)' }}
          >
            <Store size={13} className="text-[#0d2137]" />
            <span className="text-xs font-black text-[#0d2137] tracking-wide">{SCANNED_RESTAURANT.name}</span>
          </div>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
          >
            <UserPlus size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Register as a debtor?</h2>
          <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs">
            You're not yet registered at <span className="font-bold text-gray-700">{SCANNED_RESTAURANT.name}</span>. Would you like to register so you can log orders on credit?
          </p>
          <div className="w-full my-8 border-t border-gray-100" />
          <div className="w-full space-y-3 mb-8 text-left">
            {["You'll be added as a debtor at this restaurant", 'The cashier will be notified immediately', 'You can start logging orders right away'].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>
                  {i + 1}
                </div>
                <p className="text-xs font-semibold text-gray-600">{text}</p>
              </div>
            ))}
          </div>
          <button onClick={handleAccept} className="w-full py-4 rounded-2xl font-bold text-white text-sm active:scale-[0.98] transition-all mb-3"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)', boxShadow: '0 6px 20px rgba(13,33,55,0.2)' }}>
            ✓ Accept — Register at {SCANNED_RESTAURANT.name}
          </button>
          <button onClick={handleDecline} className="w-full py-3.5 rounded-2xl font-bold text-red-400 text-sm bg-red-50 border border-red-100 active:scale-[0.98] transition-all">
            ✕ Decline
          </button>
        </div>
      </CustomerLayout>
    );
  }

  // ── 4. Order Entry ───────────────────────────────────────────────────────────
  if (step === 'order') {
    return (
      <CustomerLayout title="Log Order" showBack>
        <div className="space-y-4">
          <div className="rounded-2xl px-5 py-4" style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Logging order at</p>
            <p className="text-base font-black text-white">{SCANNED_RESTAURANT.name}</p>
            <p className="text-xs text-white/50 font-medium mt-1">Today — {today}</p>
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">Order Description</label>
            <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)} placeholder="e.g. Burger & Fries"
              className="w-full px-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">Amount (ZAR)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full px-5 py-5 bg-white rounded-2xl border border-gray-100 outline-none text-2xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-gray-200"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
          </div>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] mt-2 ${canSubmit ? 'text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            style={canSubmit ? { background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)', boxShadow: '0 6px 20px rgba(13,33,55,0.2)' } : {}}>
            Submit Order — Notify Cashier
          </button>
          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Show the confirmation screen to your cashier
          </p>
        </div>
      </CustomerLayout>
    );
  }

  // ── 5. Submitted ─────────────────────────────────────────────────────────────
  return (
    <CustomerLayout title="Order Submitted" showBack>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5 border border-emerald-100">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Order Logged!</h2>
        <p className="text-sm text-gray-400 font-medium mb-1">The cashier has been notified.</p>
        <p className="text-sm text-gray-400 font-medium">Show this screen to confirm your order.</p>
        <div className="mt-8 w-full rounded-2xl p-6 text-left" style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Order Summary</p>
          <p className="text-3xl font-black text-white mb-5">{formatZAR(parseFloat(amount))}</p>
          <div className="rounded-2xl px-4 py-3 space-y-2.5" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[{ label: 'Item', value: orderName }, { label: 'Restaurant', value: SCANNED_RESTAURANT.name }, { label: 'Date', value: today }, { label: 'Status', value: '✓ Notified cashier' }].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-white/40 font-medium">{label}</span>
                <span className={`text-xs font-bold ${label === 'Status' ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => navigate('/customer/dashboard')} className="mt-6 w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-600 active:scale-[0.98] transition-all">
          Back to Dashboard
        </button>
      </div>
    </CustomerLayout>
  );
};

export default Scan;