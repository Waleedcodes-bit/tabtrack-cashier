import React, { useState, useEffect } from 'react';
import { Search, X, Loader } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';
import { formatZAR } from '../../utils/format';

const TODAY         = new Date().toISOString().split('T')[0];
const CURRENT_MONTH = TODAY.slice(0, 7);
const LAST_MONTH    = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
const getWeekAgo    = () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; };

const TransactionHistory = () => {
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [monthFilter, setMonthFilter]           = useState('week');
  const [customFrom, setCustomFrom]             = useState('');
  const [customTo, setCustomTo]                 = useState('');

  const [ownerId, setOwnerId]       = useState(null);
  const [customers, setCustomers]   = useState([]);
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);

  /* ── Fetch owner id + all customers + all orders once ── */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setOwnerId(user.id);

        const [custRes, ordRes] = await Promise.all([
          supabase
            .from('customers')
            .select('id, name, code')
            .eq('owner_id', user.id)
            .order('name'),
          supabase
            .from('orders')
            .select('id, customer_id, name, amount, date')
            .in(
              'customer_id',
              // sub-select ids via JS after customers load — we'll refetch after
              []
            ),
        ]);

        const custData = custRes.data || [];
        setCustomers(custData);

        // Now fetch orders filtered to this owner's customers
        if (custData.length > 0) {
          const ids = custData.map(c => c.id);
          const { data: orderData, error: ordError } = await supabase
            .from('orders')
            .select('id, customer_id, name, amount, date')
            .in('customer_id', ids)
            .order('date', { ascending: false });

          if (ordError) throw ordError;
          setOrders(orderData || []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('TransactionHistory fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* ── Search results ── */
  const searchResults = searchQuery.length > 0
    ? customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  /* ── Get orders (optionally filtered by selected customer) ── */
  const getOrders = () => {
    const base = selectedCustomer
      ? orders.filter(o => o.customer_id === selectedCustomer.id)
      : [...orders];

    return base.map(o => ({
      ...o,
      customerName: customers.find(c => c.id === o.customer_id)?.name || 'Unknown',
    }));
  };

  const filterOrders = list => {
    if (monthFilter === 'week')   return list.filter(o => o.date >= getWeekAgo());
    if (monthFilter === 'today')  return list.filter(o => o.date === TODAY);
    if (monthFilter === 'this')   return list.filter(o => o.date?.startsWith(CURRENT_MONTH));
    if (monthFilter === 'last')   return list.filter(o => o.date?.startsWith(LAST_MONTH));
    if (monthFilter === 'custom' && customFrom && customTo)
      return list.filter(o => o.date >= customFrom && o.date <= customTo);
    if (monthFilter === 'custom' && customFrom)
      return list.filter(o => o.date >= customFrom);
    return list;
  };

  const filteredOrders = filterOrders(getOrders()).sort((a, b) => new Date(b.date) - new Date(a.date));
  const ordersTotal    = filteredOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <MainLayout title="Transactions" showBack>
      <div className="space-y-4">

        {/* ── Search ── */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-white/5 rounded-2xl text-sm font-medium text-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none border border-gray-100 dark:border-white/10 focus:border-emerald-400 transition-colors"
          />
        </div>

        {/* ── Search Results ── */}
        {searchQuery.length > 0 && (
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-white/30 text-sm font-medium py-4">No accounts found</p>
            ) : (
              searchResults.map(c => (
                <div key={c.id}
                  onClick={() => { setSelectedCustomer(c); setSearchQuery(''); }}
                  className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}>
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">{c.code}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Selected Customer Chip ── */}
        {selectedCustomer && searchQuery.length === 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}>
              <span>{selectedCustomer.name}</span>
              <button onClick={() => setSelectedCustomer(null)} className="ml-1 opacity-60 hover:opacity-100">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ── Period Filter Tabs ── */}
        {searchQuery.length === 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { key: 'week',   label: 'This Week' },
              { key: 'today',  label: 'Today' },
              { key: 'this',   label: 'This Month' },
              { key: 'last',   label: 'Last Month' },
              { key: 'custom', label: 'Custom' },
            ].map(f => (
              <button key={f.key} onClick={() => setMonthFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  monthFilter === f.key
                    ? 'text-white'
                    : 'bg-white dark:bg-white/5 text-gray-400 dark:text-white/30 border border-gray-100 dark:border-white/10'
                }`}
                style={monthFilter === f.key ? { backgroundColor: '#0f2347' } : undefined}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Custom Date Range ── */}
        {monthFilter === 'custom' && searchQuery.length === 0 && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest block mb-1 ml-1">From</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 outline-none text-sm font-semibold text-gray-700 dark:text-white focus:border-emerald-400 transition-colors" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest block mb-1 ml-1">To</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 outline-none text-sm font-semibold text-gray-700 dark:text-white focus:border-emerald-400 transition-colors" />
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader size={22} className="animate-spin text-gray-300 dark:text-white/20" />
          </div>
        )}

        {/* ── Orders List ── */}
        {!loading && searchQuery.length === 0 && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-8 text-center text-sm text-gray-400 dark:text-white/30 font-medium">
                {monthFilter === 'custom' && !customFrom && !customTo
                  ? 'Select a date range above to filter transactions'
                  : 'No transactions found'}
              </div>
            ) : (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                {filteredOrders.map((order, i) => (
                  <div key={order.id}
                    className={`flex justify-between items-center px-5 py-4 ${
                      i < filteredOrders.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''
                    }`}>
                    <div>
                      <p className="font-bold text-base text-gray-900 dark:text-white">{order.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-medium text-gray-400 dark:text-white/40">{order.date}</p>
                        {!selectedCustomer && (
                          <>
                            <span className="text-sm text-gray-300 dark:text-white/10">•</span>
                            <p className="text-sm font-medium text-gray-400 dark:text-white/40">{order.customerName}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-base text-gray-900 dark:text-white">{formatZAR(order.amount)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Total ── */}
            {filteredOrders.length > 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="flex justify-between items-center px-5 py-4 bg-gray-50 dark:bg-white/5">
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Total</p>
                  <p className="font-black text-base text-[#0f2347] dark:text-emerald-400">{formatZAR(ordersTotal)}</p>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </MainLayout>
  );
};

export default TransactionHistory;