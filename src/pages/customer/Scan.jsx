import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, ShieldX, Store, UserPlus, X, Keyboard } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { supabase } from '../../lib/supabase';
import { formatZAR } from '../../utils/format';
import { addNotification } from '../../store/notificationStore';
import { sendPushNotification } from '../../utils/pushNotifications';

const Scan = () => {
  const navigate = useNavigate();

  const [step, setStep]                     = useState('scan');
  const [scanning, setScanning]             = useState(false);
  const [cameraError, setCameraError]       = useState('');
  const [loading, setLoading]               = useState(false);
  const [showDeclined, setShowDeclined]     = useState(false);
  const [showManual, setShowManual]         = useState(false);
  const [manualCode, setManualCode]         = useState('');
  const [manualError, setManualError]       = useState('');

  const [cashierProfile, setCashierProfile] = useState(null);
  const [customerRow, setCustomerRow]       = useState(null);
  const [blockedBalance, setBlockedBalance] = useState(0);

  const [orderName, setOrderName] = useState('');
  const [amount, setAmount]       = useState('');

  const today      = new Date().toISOString().split('T')[0];
  const canSubmit  = orderName.trim() && amount;
  const qrRegionId = 'qr-reader';
  const html5QrRef = useRef(null);

  const startCamera = async () => {
    setCameraError('');
    setScanning(true);
    await new Promise(r => setTimeout(r, 150));
    const qr = new Html5Qrcode(qrRegionId);
    html5QrRef.current = qr;
    try {
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => handleQrResult(decodedText),
        () => {}
      );
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions and try again.');
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch (_) {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    if (step !== 'scan') stopCamera();
  }, [step]);

  useEffect(() => () => { stopCamera(); }, []);

  // Core lookup — shared by QR scan and manual entry
  const lookupCode = async (code) => {
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, business_name, code')
      .eq('code', code.trim().toUpperCase())
      .eq('role', 'owner')
      .single();

    if (profileErr || !profile) return null;
    return profile;
  };

  const handleQrResult = async (code) => {
    await stopCamera();
    setLoading(true);
    try {
      const profile = await lookupCode(code);

      if (!profile) {
        setCameraError('QR code not recognised. Make sure you scan the cashier\'s QR code.');
        setLoading(false);
        return;
      }

      await continueWithProfile(profile);
    } catch (err) {
      console.error('QR lookup error:', err);
      setCameraError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const code = manualCode.trim().toUpperCase();
    if (!code) { setManualError('Please enter a code.'); return; }
    setManualError('');
    setLoading(true);
    try {
      const profile = await lookupCode(code);
      if (!profile) {
        setManualError('Code not found. Double-check the code and try again.');
        setLoading(false);
        return;
      }
      setShowManual(false);
      setManualCode('');
      await continueWithProfile(profile);
    } catch (err) {
      console.error('Manual lookup error:', err);
      setManualError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const continueWithProfile = async (profile) => {
    setCashierProfile(profile);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/customer/login'); return; }

    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('auth_user_id', user.id)
      .eq('owner_id', profile.id)
      .single();

    if (existing) {
      setCustomerRow(existing);
      if (existing.unsettled_previous_month) {
        setBlockedBalance(existing.previous_month_balance || 0);
        setStep('blocked');
      } else {
        setStep('order');
      }
    } else {
      setStep('confirm');
    }
  };

  const handleAccept = async () => {
  setLoading(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('full_name, phone, email')
      .eq('id', user.id)
      .single();

    const newCustomer = {
      name:                     myProfile?.full_name || user.email,
      code:                     user.id.slice(0, 8).toUpperCase(),
      owner_id:                 cashierProfile.id,
      auth_user_id:             user.id,
      balance:                  0,
      joined_date:              today,
      unsettled_previous_month: false,
      previous_month_balance:   0,
    };

    const { data: inserted, error } = await supabase
      .from('customers')
      .insert(newCustomer)
      .select()
      .single();

    if (error) throw error;

    setCustomerRow(inserted);

    // Notify cashier
    await addNotification({
      user_id: cashierProfile.id,
      type:    'order',
      title:   'New customer linked',
      body:    `${inserted.name} registered at ${cashierProfile.business_name}`,
    });

    await sendPushNotification({
      userId: cashierProfile.id,
      title:  'New customer linked',
      body:   `${inserted.name} registered at ${cashierProfile.business_name}`,
      url:    '/debtors',
    });

    setStep('order');
  } catch (err) {
    console.error('Register customer error:', err);
    setCameraError('Could not register. Please try again.');
    setStep('scan');
  } finally {
    setLoading(false);
  }
};

  const handleDecline = () => {
    setShowDeclined(true);
    setTimeout(() => navigate('/customer/dashboard'), 2000);
  };

  const handleSubmit = async () => {
  if (!canSubmit || !customerRow) return;
  setLoading(true);

  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('orders')
      .insert({
        customer_id: customerRow.id,
        name:        orderName.trim(),
        amount:      parseFloat(amount),
        date:        today,
        disputed:    false,
      });

    if (error) throw error;

    // Notify cashier
    await addNotification({
      user_id: cashierProfile.id,
      type:    'order',
      title:   'New order added',
      body:    `${customerRow.name} — ${orderName.trim()}`,
      amount:  formatZAR(parseFloat(amount)),
    });

    // Notify customer
    await addNotification({
      user_id: user.id,
      type:    'order',
      title:   'Order logged',
      body:    `${orderName.trim()} at ${cashierProfile.business_name}`,
      amount:  formatZAR(parseFloat(amount)),
    });

    await sendPushNotification({
      userId: cashierProfile.id,
      title:  'New order added',
      body:   `${customerRow.name} — ${orderName.trim()} · ${formatZAR(parseFloat(amount))}`,
      url:    '/debtors',
    });

    setStep('submitted');
  } catch (err) {
    console.error('Submit order error:', err);
    setCameraError('Failed to submit order. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // ── 1. Scan ──────────────────────────────────────────────────────────────────
  if (step === 'scan') {
    return (
      <CustomerLayout title="Scan QR Code" showBack>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-xs rounded-3xl overflow-hidden mb-6 relative"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)', minHeight: 260 }}>
            {scanning
              ? <div id={qrRegionId} className="w-full" />
              : (
                <div className="flex items-center justify-center" style={{ minHeight: 260 }}>
                  {['top-4 left-4 border-t-2 border-l-2 rounded-tl-xl', 'top-4 right-4 border-t-2 border-r-2 rounded-tr-xl',
                    'bottom-4 left-4 border-b-2 border-l-2 rounded-bl-xl', 'bottom-4 right-4 border-b-2 border-r-2 rounded-br-xl'].map((cls, i) => (
                    <div key={i} className={`absolute w-8 h-8 border-white/40 ${cls}`} />
                  ))}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                      <Store size={32} className="text-white/50" />
                    </div>
                    <p className="text-white/50 text-xs font-semibold">Camera off</p>
                  </div>
                </div>
              )
            }
          </div>

          {cameraError && (
            <div className="w-full mb-4 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              <p className="text-xs font-semibold text-red-500 text-center">{cameraError}</p>
            </div>
          )}

          {loading
            ? (
              <div className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-gray-500 dark:text-white/40">Looking up code…</span>
              </div>
            )
            : scanning
            ? (
              <button onClick={stopCamera}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white active:scale-[0.98] transition-all">
                Cancel
              </button>
            )
            : (
              <>
                <button onClick={startCamera}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm active:scale-[0.98] transition-all mb-3"
                  style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)', boxShadow: '0 6px 20px rgba(13,33,55,0.2)' }}>
                  Open Camera & Scan
                </button>

                {/* Manual entry toggle */}
                <button
                  onClick={() => { setShowManual(v => !v); setManualError(''); }}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white"
                >
                  <Keyboard size={15} />
                  Enter Code Manually
                </button>

                {showManual && (
                  <div className="w-full mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-wider block mb-2 ml-1">
                        Cashier Code
                      </label>
                      <input
                        type="text"
                        value={manualCode}
                        onChange={e => setManualCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                        placeholder="e.g. 2CF87"
                        maxLength={10}
                        className="w-full px-4 py-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 outline-none text-xl font-black text-center tracking-[0.2em] text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all uppercase"
                      />
                    </div>
                    {manualError && (
                      <p className="text-xs text-red-500 font-semibold text-center">{manualError}</p>
                    )}
                    <button
                      onClick={handleManualSubmit}
                      disabled={!manualCode.trim() || loading}
                      className="w-full py-4 rounded-2xl font-bold text-white text-sm active:scale-[0.98] transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
                    >
                      {loading ? 'Looking up…' : 'Find Restaurant'}
                    </button>
                  </div>
                )}
              </>
            )
          }

          <p className="text-xs text-gray-400 dark:text-white/30 font-medium text-center mt-4">
            Point your camera at the cashier's QR code, or enter the code manually
          </p>
        </div>
      </CustomerLayout>
    );
  }

  // ── 2. Blocked ───────────────────────────────────────────────────────────────
  if (step === 'blocked') {
    return (
      <CustomerLayout title="Account Blocked" showBack>
        <div className="flex flex-col items-center justify-center py-10 text-center px-2">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mb-6">
            <ShieldX size={36} className="text-red-500" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Account Blocked</h2>
          <p className="text-sm text-gray-400 dark:text-white/40 font-medium leading-relaxed max-w-xs mb-1">Your account at</p>
          <p className="text-sm font-black text-gray-900 dark:text-white mb-3">{cashierProfile?.business_name}</p>
          <p className="text-sm text-gray-400 dark:text-white/40 font-medium leading-relaxed max-w-xs mb-6">
            has an unsettled balance of{' '}
            <span className="font-black text-red-500">{formatZAR(blockedBalance)}</span>{' '}
            from last month. You cannot add new orders until this is settled.
          </p>
          <div className="w-full rounded-2xl px-5 py-4 mb-8 border border-red-100 dark:border-red-500/20"
            style={{ backgroundColor: 'rgba(239,68,68,0.05)' }}>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">What to do</p>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-relaxed">
              Please speak to the cashier at <span className="font-bold">{cashierProfile?.business_name}</span> to settle your previous month's balance.
            </p>
          </div>
          <button onClick={() => navigate('/customer/dashboard')}
            className="w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white active:scale-[0.98] transition-all">
            Back to Dashboard
          </button>
        </div>
      </CustomerLayout>
    );
  }

  // ── 3. Confirm Registration ──────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <CustomerLayout title="New Restaurant" showBack>
        <div className="flex flex-col items-center py-10 text-center px-2">
          {showDeclined && (
            <div className="fixed top-6 left-4 right-4 z-50 bg-gray-900 text-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl">
              <X size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-sm font-semibold">Declined. Returning home…</p>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(13,33,55,0.06)', border: '1px solid rgba(13,33,55,0.08)' }}>
            <Store size={13} className="text-[#0d2137] dark:text-emerald-400" />
            <span className="text-xs font-black text-[#0d2137] dark:text-emerald-400 tracking-wide">
              {cashierProfile?.business_name}
            </span>
          </div>

          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>
            <UserPlus size={32} className="text-white" />
          </div>

          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Register as a debtor?</h2>
          <p className="text-sm text-gray-400 dark:text-white/40 font-medium leading-relaxed max-w-xs">
            You're not yet registered at{' '}
            <span className="font-bold text-gray-700 dark:text-white">{cashierProfile?.business_name}</span>.
            {' '}Register to log orders on credit.
          </p>

          <div className="w-full my-8 border-t border-gray-100 dark:border-white/10" />

          <div className="w-full space-y-3 mb-8 text-left">
            {["You'll be added as a debtor at this restaurant", "The cashier will be notified immediately", "You can start logging orders right away"].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>
                  {i + 1}
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-white/60">{text}</p>
              </div>
            ))}
          </div>

          <button onClick={handleAccept} disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm active:scale-[0.98] transition-all mb-3 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)', boxShadow: '0 6px 20px rgba(13,33,55,0.2)' }}>
            {loading ? 'Registering…' : `✓ Accept — Register at ${cashierProfile?.business_name}`}
          </button>
          <button onClick={handleDecline}
            className="w-full py-3.5 rounded-2xl font-bold text-red-400 text-sm bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 active:scale-[0.98] transition-all">
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
          <div className="rounded-2xl px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Logging order at</p>
            <p className="text-base font-black text-white">{cashierProfile?.business_name}</p>
            <p className="text-xs text-white/50 font-medium mt-1">Today — {today}</p>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-wider block mb-2 ml-1">
              Order Description
            </label>
            <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)}
              placeholder="e.g. Burger & Fries"
              className="w-full px-4 py-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 outline-none text-sm font-semibold text-gray-700 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all" />
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-wider block mb-2 ml-1">
              Amount (ZAR)
            </label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-5 py-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 outline-none text-2xl font-bold text-gray-900 dark:text-white placeholder:text-gray-200 dark:placeholder:text-white/10 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
          </div>

          {cameraError && (
            <p className="text-xs text-red-500 font-semibold text-center">{cameraError}</p>
          )}

          <button onClick={handleSubmit} disabled={!canSubmit || loading}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] mt-2 ${canSubmit && !loading ? 'text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed'}`}
            style={canSubmit && !loading ? { background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)', boxShadow: '0 6px 20px rgba(13,33,55,0.2)' } : {}}>
            {loading ? 'Submitting…' : 'Submit Order — Notify Cashier'}
          </button>

          <p className="text-center text-[10px] text-gray-400 dark:text-white/30 uppercase tracking-widest font-bold">
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
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 border border-emerald-100 dark:border-emerald-500/20">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Order Logged!</h2>
        <p className="text-sm text-gray-400 dark:text-white/40 font-medium mb-1">The cashier has been notified.</p>
        <p className="text-sm text-gray-400 dark:text-white/40 font-medium">Show this screen to confirm your order.</p>

        <div className="mt-8 w-full rounded-2xl p-6 text-left"
          style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Order Summary</p>
          <p className="text-3xl font-black text-white mb-5">{formatZAR(parseFloat(amount))}</p>
          <div className="rounded-2xl px-4 py-3 space-y-2.5"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { label: 'Item',       value: orderName },
              { label: 'Restaurant', value: cashierProfile?.business_name },
              { label: 'Date',       value: today },
              { label: 'Status',     value: '✓ Notified cashier' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-white/40 font-medium">{label}</span>
                <span className={`text-xs font-bold ${label === 'Status' ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/customer/dashboard')}
          className="mt-6 w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white active:scale-[0.98] transition-all">
          Back to Dashboard
        </button>
      </div>
    </CustomerLayout>
  );
};

export default Scan;