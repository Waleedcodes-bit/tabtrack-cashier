import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { formatZAR } from '../../utils/format';
import { supabase } from '../../lib/supabase';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const LAST_MONTH    = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
const getWeekAgo    = () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; };

const CustomerHistory = () => {
  const [searchQuery, setSearchQuery]               = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // customer row id
  const [monthFilter, setMonthFilter]               = useState('week');
  const [customFrom, setCustomFrom]                 = useState('');
  const [customTo, setCustomTo]                     = useState('');

  const [restaurants, setRestaurants] = useState([]); // all linked restaurants
  const [orders, setOrders]           = useState([]); // all orders across all restaurants
  const [loading, setLoading]         = useState(true);

  // ── Fetch all linked restaurants + their orders ───────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Get all customer rows for this auth user
    const { data: customerRows, error: custError } = await supabase
      .from('customers')
      .select('id, owner_id, unsettled_previous_month, previous_month_balance')
      .eq('auth_user_id', user.id);

    if (custError || !customerRows || customerRows.length === 0) {
      setLoading(false);
      return;
    }

    const customerIds = customerRows.map(r => r.id);
    const ownerIds    = customerRows.map(r => r.owner_id).filter(Boolean);

    // Get owner business names + codes
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, business_name, owner_name, code')
      .in('id', ownerIds);

    const ownerMap = {};
    (owners || []).forEach(o => { ownerMap[o.id] = o; });

    // Build restaurant list
    const restaurantList = customerRows.map(row => ({
      customerId: row.id,
      ownerId:    row.owner_id,
      name:       ownerMap[row.owner_id]?.business_name || ownerMap[row.owner_id]?.owner_name || 'Unknown',
      code:       ownerMap[row.owner_id]?.code || '',
      // rollover: if unsettled_previous_month, carry forward previous_month_balance
      rollover: row.unsettled_previous_month
        ? {
            amount:    row.previous_month_balance || 0,
            fromMonth: LAST_MONTH,
          }
        : null,
    }));

    setRestaurants(restaurantList);

    // Fetch all orders for all customer rows
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, customer_id, name, amount, date')
      .in('customer_id', customerIds)
      .order('date', { ascending: false });

    if (ordersError) { console.error('fetchOrders:', ordersError); setLoading(false); return; }

    // Map customer_id → restaurant info
    const custRestaurantMap = {};
    restaurantList.forEach(r => { custRestaurantMap[r.customerId] = r; });

    const enrichedOrders = (allOrders || []).map(o => ({
      id:             o.id,
      customerId:     o.customer_id,
      restaurantId:   custRestaurantMap[o.customer_id]?.customerId || o.customer_id,
      restaurantName: custRestaurantMap[o.customer_id]?.name || 'Unknown',
      name:           o.name,
      amount:         o.amount,
      date:           o.date,
    }));

    setOrders(enrichedOrders);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Search results ────────────────────────────────────────────────────────
  const searchResults = searchQuery.length > 0
    ? restaurants.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // ── Filter orders by selected restaurant + date range ────────────────────
  const getFilteredOrders = () => {
    let result = selectedRestaurant
      ? orders.filter(o => o.restaurantId === selectedRestaurant)
      : orders;

    if (monthFilter === 'week')   return result.filter(o => o.date >= getWeekAgo());
    if (monthFilter === 'this')   return result.filter(o => o.date?.startsWith(CURRENT_MONTH));
    if (monthFilter === 'last')   return result.filter(o => o.date?.startsWith(LAST_MONTH));
    if (monthFilter === 'custom' && customFrom && customTo)
      return result.filter(o => o.date >= customFrom && o.date <= customTo);
    if (monthFilter === 'custom' && customFrom)
      return result.filter(o => o.date >= customFrom);
    return result;
  };

  const filteredOrders = getFilteredOrders().sort((a, b) => new Date(b.date) - new Date(a.date));
  const ordersTotal    = filteredOrders.reduce((sum, o) => sum + o.amount, 0);

  // Rollover: only show when "this month" filter + a specific restaurant selected
  const selectedRestaurantData = restaurants.find(r => r.customerId === selectedRestaurant);
  const showRollover  = monthFilter === 'this' && selectedRestaurant && selectedRestaurantData?.rollover;
  const rolloverData  = showRollover ? selectedRestaurantData.rollover : null;

  return (
    <CustomerLayout title="Transaction History" showBack>
      <div className="space-y-4">

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-white/5 rounded-2xl text-sm font-medium text-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none border border-gray-100 dark:border-white/10 focus:border-emerald-400 transition-colors"
          />
        </div>

        {/* Search Results */}
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
                    style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}>
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

        {/* Selected Restaurant Chip */}
        {selectedRestaurant && searchQuery.length === 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}>
              <span>{selectedRestaurantData?.name}</span>
              <button onClick={() => setSelectedRestaurant(null)} className="ml-1 opacity-60 hover:opacity-100">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Period Filter Tabs */}
        {searchQuery.length === 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { key: 'week',   label: 'This Week'  },
              { key: 'this',   label: 'This Month' },
              { key: 'last',   label: 'Last Month' },
              { key: 'custom', label: 'Custom'     },
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

        {/* Custom Date Range */}
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

        {/* Rollover Banner */}
        {rolloverData && (
          <div className="rounded-2xl px-5 py-4 flex justify-between items-center"
            style={{ backgroundColor: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.12)' }}>
            <div>
              <p className="font-bold text-sm text-orange-700 dark:text-orange-400">Rollover from {rolloverData.fromMonth}</p>
              <p className="text-xs text-orange-500 dark:text-orange-400/60 font-bold uppercase tracking-wider mt-0.5">
                Carried forward into this month
              </p>
            </div>
            <p className="font-black text-sm text-orange-700 dark:text-orange-400">{formatZAR(rolloverData.amount)}</p>
          </div>
        )}

        {/* Orders List */}
        {searchQuery.length === 0 && (
          <>
            {loading ? (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-8 text-center text-sm text-gray-400 dark:text-white/30 font-medium">
                Loading transactions…
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-8 text-center text-sm text-gray-400 dark:text-white/30 font-medium">
                No transactions found
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
                        {!selectedRestaurant && (
                          <>
                            <span className="text-sm text-gray-300 dark:text-white/10">•</span>
                            <p className="text-sm font-medium text-gray-400 dark:text-white/40">{order.restaurantName}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-base text-gray-900 dark:text-white">{formatZAR(order.amount)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {!loading && filteredOrders.length > 0 && (
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
    </CustomerLayout>
  );
};

export default CustomerHistory;