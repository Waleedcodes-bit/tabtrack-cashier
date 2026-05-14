import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';

const CashierAuth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="flex flex-col min-h-screen bg-white px-7 py-14">

      {/* Back */}
      <button onClick={() => navigate('/')}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 mb-8">
        <ArrowLeft size={18} className="text-gray-600" />
      </button>

      {/* Logo */}
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3260 100%)' }}>
          <TrendingUp size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Welcome back' : 'Create Account'}
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          {mode === 'login' ? 'Sign in to your restaurant account' : 'Set up your restaurant on TabTrack'}
        </p>
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

      {/* Login Form */}
      {mode === 'login' && (
        <div className="space-y-3">
          {[
            { label: 'Email', placeholder: 'you@restaurant.com', type: 'email' },
            { label: 'Password', placeholder: '••••••••', type: 'password' },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500/20 border border-gray-100 transition-all"
              />
            </div>
          ))}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-white py-4 rounded-2xl font-bold text-sm mt-2 transition-all active:scale-[0.98] shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3260 100%)' }}
          >
            Sign In
          </button>
        </div>
      )}

      {/* Register Form */}
      {mode === 'register' && (
        <div className="space-y-3">
          {[
            { label: 'Restaurant Name', placeholder: 'The Green Bistro', type: 'text' },
            { label: 'Owner Name', placeholder: 'John Smith', type: 'text' },
            { label: 'Email Address', placeholder: 'you@restaurant.com', type: 'email' },
            { label: 'Password', placeholder: '••••••••', type: 'password' },
            { label: 'Confirm Password', placeholder: '••••••••', type: 'password' },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500/20 border border-gray-100 transition-all"
              />
            </div>
          ))}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-white py-4 rounded-2xl font-bold text-sm mt-2 shadow-lg active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3260 100%)' }}
          >
            Create Account
          </button>
        </div>
      )}
    </div>
  );
};

export default CashierAuth;