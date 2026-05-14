import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Store } from 'lucide-react';

const CustomerAuth = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mode, setMode] = useState('login');

  // If the user arrived here from a QR scan, we get the restaurant context
  const fromQR     = location.state?.fromQR     ?? false;
  const restaurant = location.state?.restaurant ?? null;

  const handleRegister = () => {
    // In production:
    // 1. Create account
    // 2. If fromQR → auto-link customer to restaurant.id as a debtor
    // 3. Trigger push notification to cashier: "New customer registered"
    // 4. Navigate back to order form
    if (fromQR) {
      navigate('/customer/scan'); // returns to scan → IS_EXISTING_DEBTOR will now be true
    } else {
      navigate('/customer/dashboard');
    }
  };

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="flex flex-col min-h-screen bg-white px-7 py-14"
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 mb-8"
      >
        <ArrowLeft size={18} className="text-gray-600" />
      </button>

      {/* Logo + Context */}
      <div className="mb-10">
        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-200">
          <User size={22} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          {mode === 'login'
            ? 'Sign in to your customer account'
            : 'Register to start tracking your credit'}
        </p>

        {/* QR context pill — shown when registering from a scan */}
        {fromQR && restaurant && mode === 'register' && (
          <div
            className="flex items-center gap-2 mt-4 px-3 py-2 rounded-xl w-fit"
            style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)' }}
          >
            <Store size={13} className="text-green-700" />
            <span className="text-xs font-black text-green-700">
              Registering to: {restaurant.name}
            </span>
          </div>
        )}
      </div>

      {/* Toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
        {['login', 'register'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all
              ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
          >
            {m === 'login' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>

      {/* ── Login Form ─────────────────────────────────────────────────────── */}
      {mode === 'login' && (
        <div className="space-y-3">
          {[
            { label: 'Email',    placeholder: 'you@email.com', type: 'email'    },
            { label: 'Password', placeholder: '••••••••',      type: 'password' },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 ring-green-500/30 border border-gray-100 transition-all"
              />
            </div>
          ))}
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-sm mt-2 transition-all active:scale-[0.98] shadow-lg shadow-green-200"
          >
            Sign In
          </button>
        </div>
      )}

      {/* ── Register Form ──────────────────────────────────────────────────── */}
      {mode === 'register' && (
        <div className="space-y-3">
          {[
            { label: 'Full Name',        placeholder: 'John Doe',    type: 'text'     },
            { label: 'Email Address',    placeholder: 'you@email.com', type: 'email'  },
            { label: 'Password',         placeholder: '••••••••',    type: 'password' },
            { label: 'Confirm Password', placeholder: '••••••••',    type: 'password' },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 ring-green-500/30 border border-gray-100 transition-all"
              />
            </div>
          ))}

          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-sm mt-2 shadow-lg shadow-green-200 active:scale-[0.98] transition-all"
          >
            {fromQR && restaurant
              ? `Register & Join ${restaurant.name}`
              : 'Create Account'}
          </button>

          {fromQR && restaurant && (
            <p className="text-center text-[10px] text-gray-400 font-medium leading-relaxed">
              You'll be added as a debtor at{' '}
              <span className="font-bold text-gray-500">{restaurant.name}</span>{' '}
              and can log your first order immediately.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerAuth;