import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { formatZAR } from '../../utils/format';
import { supabase } from '../../lib/supabase';

const Debtors = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter]           = useState('All');
  const [customers, setCustomers]     = useState([]);
  const [loading, setLoading]         = useState(true);

  // ── Fetch all customers belonging to this owner ───────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('customers')
      .select('id, name, code, balance, joined_date, unsettled_previous_month, previous_month_balance')
      .eq('owner_id', user.id)
      .order('name', { ascending: true });

    if (error) { console.error('fetchCustomers:', error); setLoading(false); return; }

    setCustomers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredDebtors = customers.filter(debtor => {
    const matchesSearch =
      debtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debtor.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'Owing')   return matchesSearch && debtor.balance > 0;
    if (filter === 'Settled') return matchesSearch && debtor.balance === 0;
    return matchesSearch;
  });

  return (
    <MainLayout title="Active Debtors" showBack>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search name or code..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-white/5 rounded-2xl text-sm outline-none transition-all font-medium text-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 border border-gray-100 dark:border-white/10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {['All', 'Owing', 'Settled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-black transition-all"
            style={filter === f
              ? { backgroundColor: '#0f2347', color: '#fff' }
              : { backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center">
          <span className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-wider">
            {loading ? '…' : `${filteredDebtors.length} shown`}
          </span>
        </div>
      </div>

      {/* Debtors List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 dark:text-white/30 font-medium text-sm">Loading debtors…</p>
          </div>
        ) : filteredDebtors.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 dark:text-white/30 font-medium text-sm">
              {customers.length === 0 ? 'No debtors yet' : 'No debtors found'}
            </p>
          </div>
        ) : (
          filteredDebtors.map(debtor => (
            <div
              key={debtor.id}
              onClick={() => navigate(`/debtor/${debtor.id}`)}
              className="bg-white dark:bg-white/5 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}
                >
                  {debtor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{debtor.name}</p>
                  <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mt-0.5">
                    {debtor.code}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-black text-sm text-gray-900 dark:text-white">{formatZAR(debtor.balance)}</p>
                  <p className={`text-[9px] font-black uppercase tracking-tight mt-0.5 ${
                    debtor.balance > 0 ? 'text-orange-500' : 'text-emerald-500'
                  }`}>
                    {debtor.balance > 0 ? 'Owing' : 'Settled'}
                  </p>
                </div>
                <ChevronRight size={15} className="text-gray-300 dark:text-white/20" />
              </div>
            </div>
          ))
        )}
      </div>

    </MainLayout>
  );
};

export default Debtors;