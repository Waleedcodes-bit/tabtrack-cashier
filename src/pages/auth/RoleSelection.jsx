import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, User, ArrowRight } from 'lucide-react';
import NavoqLogo from '../../assets/NavoqLogo.png';
import { supabase } from '../../lib/supabase';

const RoleSelection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile) return;

      if (profile.role === 'owner') navigate('/dashboard', { replace: true });
      else if (profile.role === 'customer') navigate('/customer/dashboard', { replace: true });
      else if (profile.role === 'admin') navigate('/admin/dashboard', { replace: true });
    };

    checkSession();
  }, [navigate]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-6 font-['Poppins']"
      style={{
        background: 'linear-gradient(135deg, #07111f 0%, #031d1b 45%, #07111f 100%)',
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute top-0 right-0 w-80 h-80 border border-white/5 rounded-full" />
        <div className="absolute top-4 right-4 w-72 h-72 border border-white/5 rounded-full" />
        <div className="absolute top-8 right-8 w-64 h-64 border border-white/5 rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 border border-white/5 rounded-full" />
        <div className="absolute bottom-4 left-4 w-72 h-72 border border-white/5 rounded-full" />
        <div className="absolute bottom-8 left-8 w-64 h-64 border border-white/5 rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">

        {/* Logo Section */}
        <div className="text-center mb-12">
          <img src={NavoqLogo} alt="Navoq logo" className="w-20 h-20 object-contain mx-auto" />
          <h1 className="text-5xl font-bold text-white tracking-tight">Navoq</h1>
          <p className="text-gray-400 mt-3 text-lg">Track. Settle. Done.</p>
        </div>

        {/* Continue As */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">
            Continue As
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-5">

          {/* Restaurant */}
          <button
            onClick={() => navigate('/cashier/login')}
            className="group w-full text-left rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20">
                <UtensilsCrossed size={26} className="text-emerald-400" />
              </div>
              <div className="flex-1 ml-5">
                <h3 className="text-xl font-semibold text-white">Restaurant / Shop</h3>
                <p className="text-gray-400 mt-1">Manage debtors, tabs and payments</p>
              </div>
              <ArrowRight size={24} className="text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Customer */}
          <button
            onClick={() => navigate('/customer/login')}
            className="group w-full text-left rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20">
                <User size={26} className="text-indigo-400" />
              </div>
              <div className="flex-1 ml-5">
                <h3 className="text-xl font-semibold text-white">Customer</h3>
                <p className="text-gray-400 mt-1">View your tab, log orders and disputes</p>
              </div>
              <ArrowRight size={24} className="text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

        </div>

        {/* Footer */}
        <div className="mt-14 text-center">
          <p className="text-sm text-gray-500">Navoq v1.0 — Digital Credit Management</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;