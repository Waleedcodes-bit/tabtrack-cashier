import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, User, ArrowRight } from 'lucide-react';
import logo from '../../assets/tabtrack-logo.png.png';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080d17] flex items-center justify-center px-6 font-['DM_Sans']">

      {/* Glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-4">
            <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TabTrack</h1>
          <p className="text-sm text-gray-500 mt-1">Track. Settle. Done.</p>
        </div>

        {/* Label */}
        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4 text-center">
          Continue as
        </p>

        {/* Cards */}
        <div className="space-y-3">

          {/* Restaurant / Shop */}
          <button
            onClick={() => navigate('/cashier/login')}
            className="w-full group flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all active:scale-[0.98] text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 transition-colors">
              <UtensilsCrossed size={20} className="text-emerald-400 group-hover:text-emerald-950 transition-colors" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Restaurant / Shop</p>
              <p className="text-xs text-gray-500 mt-0.5">Manage debtors, tabs and payments</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
          </button>

          {/* Customer */}
          <button
            onClick={() => navigate('/customer/login')}
            className="w-full group flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all active:scale-[0.98] text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
              <User size={20} className="text-blue-400 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Customer</p>
              <p className="text-xs text-gray-500 mt-0.5">View your tab, log orders and disputes</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
          </button>

        </div>

        <p className="text-center text-xs text-gray-700 mt-10">
          TabTrack v1.0 — Digital Credit Management
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;