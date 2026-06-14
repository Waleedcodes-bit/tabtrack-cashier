import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, CreditCard, TrendingDown, CalendarDays, ArrowUpRight, BarChart3, Store } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { supabase } from '../../lib/supabase';
import { formatZAR } from '../../utils/format';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const LAST_MONTH    = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
const getWeekAgo    = () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; };

const CustomerPayments = () => {
  const [restaurants,        setRestaurants]        = useState([]);
  const [payments,           setPayments]           = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [filter,             setFilter]             = useState('all');
  const [searchQuery,        setSearchQuery]        = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: customerRows } = await supabase
      .from('customers')
      .select('id, owner_id')
      .eq('auth_user_id', user.id);

    if (!customerRows || customerRows.length === 0) { setLoading(false); return; }

    const customerIds = customerRows.map(r => r.id);
    const ownerIds    = customerRows.map(r => r.owner_id).filter(Boolean);

    const { data: owners } = await supabase
      .from('profiles')
      .select('id, business_name, owner_name, code')
      .in('id', ownerIds);

    const ownerMap = {};
    (owners || []).forEach(o => { ownerMap[o.id] = o; });

    const custRestaurantMap = {};
    customerRows.forEach(r => {
      custRestaurantMap[r.id] = {
        customerId: r.id,
        name: ownerMap[r.owner_id]?.business_name || ownerMap[r.owner_id]?.owner_name || 'Unknown',
        code: ownerMap[r.owner_id]?.code || '',
      };
    });

    setRestaurants(Object.values(custRestaurantMap));

    const { data: allPayments } = await supabase
      .from('payments')
      .select('id, customer_id, amount, original_amount, date, month, created_at')
      .in('customer_id', customerIds)
      .order('date', { ascending: false });

    const enriched = (allPayments || []).map(p => ({
      id:             p.id,
      customerId:     p.customer_id,
      restaurantId:   p.customer_id,
      restaurantName: custRestaurantMap[p.customer_id]?.name || 'Unknown',
      amount:         p.amount || 0,
      originalAmount: p.original_amount ?? null,
      date:           p.date,
      month:          p.month,
      createdAt:      p.created_at,
    }));

    setPayments(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getFiltered = () => {
    let result = selectedRestaurant
      ? payments.filter(p => p.restaurantId === selectedRestaurant)
      : payments;
    if (filter === 'week') return result.filter(p => p.date >= getWeekAgo());
    if (filter === 'this') return result.filter(p => p.date?.startsWith(CURRENT_MONTH));
    if (filter === 'last') return result.filter(p => p.date?.startsWith(LAST_MONTH));
    return result;
  };

  const filtered   = getFiltered().sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalPaid  = filtered.reduce((s, p) => s + p.amount, 0);

  const allTimePaid   = payments.reduce((s, p) => s + p.amount, 0);
  const thisMonthPaid = payments.filter(p => p.date?.startsWith(CURRENT_MONTH)).reduce((s, p) => s + p.amount, 0);
  const lastMonthPaid = payments.filter(p => p.date?.startsWith(LAST_MONTH)).reduce((s, p) => s + p.amount, 0);

  const grouped = filtered.reduce((acc, p) => {
    const key = p.month || p.date?.slice(0, 7) || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const selectedRestaurantData = restaurants.find(r => r.customerId === selectedRestaurant);
  const searchResults = searchQuery.length > 0
    ? restaurants.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <CustomerLayout title="Payment History" showBack>
      <div className="space-y-4">

        {/* ── Hero summary ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0a3328 50%, #0f4d3a 100%)' }}>
          <div className="px-5 pt-5 pb-4">
            <p className="text-[10px] uppercase tracking-[1.5px] text-white/40 font-bold mb-1">Total Paid</p>
            <p className="text-4xl font-black text-white tracking-tight leading-none">{formatZAR(allTimePaid)}</p>
            <p className="text-white/30 text-xs font-medium mt-1.5">
              {payments.length} payment{payments.length !== 1 ? 's' : ''} ·{' '}
              {selectedRestaurant && selectedRestaurantData ? selectedRestaurantData.name : 'all places'}
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
            {[
              { label: 'This Month', value: formatZAR(thisMonthPaid) },
              { label: 'Last Month', value: formatZAR(lastMonthPaid) },
              { label: 'Payments',   value: payments.length },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3.5">
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-black mb-1">{label}</p>
                <p className="text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={13} className="text-emerald-500" />
              <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-wider">Largest</p>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {payments.length > 0 ? formatZAR(Math.max(...payments.map(p => p.amount))) : '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={13} className="text-blue-500" />
              <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-wider">Average</p>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {payments.length > 0 ? formatZAR(allTimePaid / payments.length) : '—'}
            </p>
          </div>
        </div>

        {/* ── Search by restaurant ── */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Filter by restaurant..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-white/5 rounded-2xl text-sm font-medium text-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none border border-gray-100 dark:border-white/10 focus:border-emerald-400 transition-colors"
          />
        </div>

        {searchQuery.length > 0 && (
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-white/30 text-sm font-medium py-4">No restaurants found</p>
            ) : (
              searchResults.map(r => (
                <div key={r.customerId}
                  onClick={() => { setSelectedRestaurant(r.customerId); setSearchQuery(''); }}
                  className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0f2347, #0f4d3a)' }}>
                    {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{r.name}</p>
                    <p className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">{r.code}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedRestaurant && searchQuery.length === 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #0f2347, #0f4d3a)' }}>
              <Store size={11} />
              <span>{selectedRestaurantData?.name}</span>
              <button onClick={() => setSelectedRestaurant(null)} className="ml-1 opacity-60 hover:opacity-100">
                <X size={11} />
              </button>
            </div>
          </div>
        )}

        {searchQuery.length === 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { key: 'all',  label: 'All Time'   },
              { key: 'week', label: 'This Week'  },
              { key: 'this', label: 'This Month' },
              { key: 'last', label: 'Last Month' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  filter === f.key
                    ? 'text-white'
                    : 'bg-white dark:bg-white/5 text-gray-400 dark:text-white/30 border border-gray-100 dark:border-white/10'
                }`}
                style={filter === f.key ? { background: 'linear-gradient(135deg, #0f2347, #0f4d3a)' } : undefined}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {searchQuery.length === 0 && (
          <>
            {loading ? (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-8 text-center text-sm text-gray-400 dark:text-white/30">
                Loading payments…
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 py-16 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                  <CreditCard size={20} className="text-gray-300 dark:text-white/20" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">No payments found</p>
                <p className="text-xs text-gray-400 dark:text-white/30 text-center px-8">
                  Payments recorded by your restaurant will show up here
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {months.map(month => {
                  const monthPayments = grouped[month];
                  const monthTotal    = monthPayments.reduce((s, p) => s + p.amount, 0);

                  return (
                    <div key={month}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em]">
                            {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <div className="h-px w-8 bg-gray-200 dark:bg-white/10" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          {formatZAR(monthTotal)}
                        </span>
                      </div>

                      <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        {monthPayments.map((p, i) => (
                          <div key={p.id}
                            className={`flex items-center gap-4 px-5 py-4 ${
                              i < monthPayments.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''
                            }`}>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                              <TrendingDown size={13} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">Payment</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <CalendarDays size={9} className="text-gray-400 dark:text-white/30" />
                                <p className="text-[10px] font-medium text-gray-400 dark:text-white/30">{p.date}</p>
                                {!selectedRestaurant && (
                                  <>
                                    <span className="text-gray-300 dark:text-white/10 text-[10px]">·</span>
                                    <p className="text-[10px] font-medium text-gray-400 dark:text-white/30 truncate">{p.restaurantName}</p>
                                  </>
                                )}
                                {p.originalAmount != null && (
                                  <>
                                    <span className="text-gray-300 dark:text-white/10 text-[10px]">·</span>
                                    <p className="text-[10px] font-bold text-amber-500 dark:text-amber-400">
                                      Edited from {formatZAR(p.originalAmount)}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                              +{formatZAR(p.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                  <div className="flex justify-between items-center px-5 py-4 bg-gray-50 dark:bg-white/5">
                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                      {filter === 'all' ? 'All Time Total' : filter === 'week' ? 'This Week Total' : filter === 'this' ? 'This Month Total' : 'Last Month Total'}
                    </p>
                    <p className="font-black text-base text-emerald-600 dark:text-emerald-400">{formatZAR(totalPaid)}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </CustomerLayout>
  );
};

export default CustomerPayments;