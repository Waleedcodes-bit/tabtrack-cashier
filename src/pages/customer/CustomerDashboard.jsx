import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, AlertCircle, Link as LinkIcon, Store, ShieldAlert } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { formatZAR } from '../../utils/format';
import { getEditRequests, subscribeEdits } from '../../store/notificationStore';

const CUSTOMER_RESTAURANTS = [
  { id: '1', name: 'The Corner Bistro', code: 'TCB-001', balance: 450.5,  image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop' },
  { id: '2', name: 'The Green Bistro',  code: 'TGB-002', balance: 320,    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop' },
];

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [editRequests, setEditRequests] = useState(getEditRequests());

  useEffect(() => subscribeEdits(setEditRequests), []);

  const pendingCount        = editRequests.filter(r => r.status === 'pending').length;
  const totalBalance        = CUSTOMER_RESTAURANTS.reduce((sum, r) => sum + r.balance, 0);
  const filteredRestaurants = CUSTOMER_RESTAURANTS.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CustomerLayout>

      {/* ── Hero Card ── */}
      <div className="rounded-3xl p-5 mb-5 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(145deg, #0d2137 0%, #0a3328 50%, #0f4d3a 100%)', boxShadow: '0 16px 48px rgba(10,33,55,0.25)' }}>
        <div className="absolute top-0 left-6 right-6 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
        <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.1), transparent 70%)' }} />

        <div className="relative z-10 mb-5">
          <p className="text-[10px] uppercase tracking-[1.5px] text-white/40 font-bold mb-1">Total Outstanding</p>
          <p className="text-4xl font-black tracking-tight leading-none">{formatZAR(totalBalance)}</p>
          <p className="text-white/30 text-xs font-medium mt-1.5">
            Across {CUSTOMER_RESTAURANTS.length} restaurant{CUSTOMER_RESTAURANTS.length !== 1 ? 's/shop' : '/shop'}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Store size={11} className="text-emerald-400" />
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-black">Places</p>
            </div>
            <p className="text-2xl font-black text-white leading-none">{CUSTOMER_RESTAURANTS.length}</p>
          </div>
          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldAlert size={11} className={pendingCount > 0 ? 'text-orange-400' : 'text-white/40'} />
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-black">Disputes</p>
            </div>
            <p className={`text-2xl font-black leading-none ${pendingCount > 0 ? 'text-orange-400' : 'text-white'}`}>
              {pendingCount}
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => navigate('/customer/disputes')}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 active:scale-95 transition-all text-left"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', ...(pendingCount > 0 ? { borderColor: 'rgba(234,88,12,0.2)' } : {}) }}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            pendingCount > 0 ? 'bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20' : 'bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10'
          }`}>
            <AlertCircle size={18} className={pendingCount > 0 ? 'text-orange-500' : 'text-gray-400 dark:text-white/30'} />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">Disputes</p>
            <p className={`text-[10px] font-medium ${pendingCount > 0 ? 'text-orange-500' : 'text-gray-400 dark:text-white/30'}`}>
              {pendingCount > 0 ? `${pendingCount} Pending` : 'No disputes'}
            </p>
          </div>
        </button>

        <button
          onClick={() => alert('Invite code copied!')}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 active:scale-95 transition-all text-left"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <LinkIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">Invite</p>
            <p className="text-[10px] text-gray-400 dark:text-white/30 font-medium">Share Code</p>
          </div>
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
        <input
          type="text"
          placeholder="Search your tabs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-white/5 rounded-2xl text-sm font-medium text-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none border border-gray-100 dark:border-white/10"
        />
      </div>

      {/* ── Restaurant List ── */}
      <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 dark:text-white/30 mb-3">My Tabs</p>
      <div className="space-y-3">
        {filteredRestaurants.length === 0 ? (
          <div className="bg-white dark:bg-white/5 rounded-2xl p-8 text-center border border-gray-100 dark:border-white/10">
            <p className="text-sm text-gray-400 dark:text-white/30 font-medium">No restaurants or shops found</p>
          </div>
        ) : (
          filteredRestaurants.map(res => (
            <button key={res.id} onClick={() => navigate(`/customer/restaurant/${res.id}`)}
              className="w-full group relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 active:scale-[0.98] transition-all text-left hover:border-gray-200 dark:hover:border-white/20">
              <div className="flex">
                <div className="relative w-24 h-28 overflow-hidden flex-shrink-0">
                  <img src={res.image} alt={res.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="text-gray-900 dark:text-white font-bold text-sm leading-tight truncate">{res.name}</h3>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mt-0.5">{res.code}</p>
                    </div>
                    <ChevronRight size={15} className="text-gray-300 dark:text-white/20 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{formatZAR(res.balance)}</p>
                    <p className="text-[9px] text-gray-400 dark:text-white/30 uppercase font-black tracking-widest mt-0.5">Outstanding</p>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

    </CustomerLayout>
  );
};

export default CustomerDashboard;