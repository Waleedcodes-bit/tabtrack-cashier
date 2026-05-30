import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { formatZAR } from '../../utils/format';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const LAST_MONTH    = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
const getWeekAgo    = () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; };

const RESTAURANT_DATA = {
  '1': {
    name: 'The Corner Bistro',
    code: 'TCB-001',
    rollover: { amount: 240.50, fromMonth: '2026-04' },
    orders: [
      { id: 'o1', name: 'Burger & Fries', amount: 120,    date: '2026-05-03' },
      { id: 'o2', name: 'Craft Beer x2',  amount: 90,     date: '2026-05-02' },
      { id: 'o3', name: 'Steak Dinner',   amount: 240.50, date: '2026-04-22' },
    ],
  },
  '2': {
    name: 'The Green Bistro',
    code: 'TGB-002',
    rollover: null,
    orders: [
      { id: 'o4', name: 'Steak Dinner', amount: 240, date: '2026-05-04' },
      { id: 'o5', name: 'Wine x2',      amount: 80,  date: '2026-05-01' },
      { id: 'o6', name: 'Pasta',        amount: 95,  date: '2026-04-18' },
    ],
  },
};

const ALL_RESTAURANTS = Object.entries(RESTAURANT_DATA).map(([id, data]) => ({
  id, name: data.name, code: data.code,
}));

const CustomerHistory = () => {
  const [searchQuery, setSearchQuery]               = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [monthFilter, setMonthFilter]               = useState('week');
  const [customFrom, setCustomFrom]                 = useState('');
  const [customTo, setCustomTo]                     = useState('');

  const searchResults = searchQuery.length > 0
    ? ALL_RESTAURANTS.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getOrders = () => {
    const sources = selectedRestaurant
      ? [{ id: selectedRestaurant, ...RESTAURANT_DATA[selectedRestaurant] }]
      : Object.entries(RESTAURANT_DATA).map(([id, data]) => ({ id, ...data }));
    return sources.flatMap(r =>
      r.orders.map(o => ({ ...o, restaurantName: r.name, restaurantId: r.id }))
    );
  };

  const filterOrders = orders => {
    if (monthFilter === 'week')   return orders.filter(o => o.date >= getWeekAgo());
    if (monthFilter === 'this')   return orders.filter(o => o.date.startsWith(CURRENT_MONTH));
    if (monthFilter === 'last')   return orders.filter(o => o.date.startsWith(LAST_MONTH));
    if (monthFilter === 'custom' && customFrom && customTo)
      return orders.filter(o => o.date >= customFrom && o.date <= customTo);
    if (monthFilter === 'custom' && customFrom)
      return orders.filter(o => o.date >= customFrom);
    return orders;
  };

  const filteredOrders = filterOrders(getOrders()).sort((a, b) => new Date(b.date) - new Date(a.date));

  const showRollover  = monthFilter === 'this' && selectedRestaurant && RESTAURANT_DATA[selectedRestaurant]?.rollover;
  const rolloverData  = showRollover ? RESTAURANT_DATA[selectedRestaurant].rollover : null;
  const ordersTotal   = filteredOrders.reduce((sum, o) => sum + o.amount, 0);

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
                <div
                  key={r.id}
                  onClick={() => { setSelectedRestaurant(r.id); setSearchQuery(''); }}
                  className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}
                  >
                    {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{r.name}</p>
                    <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">{r.code}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Selected Restaurant Chip */}
        {selectedRestaurant && searchQuery.length === 0 && (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}
            >
              <span>{RESTAURANT_DATA[selectedRestaurant].name}</span>
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
              { key: 'week',   label: 'This Week' },
              { key: 'this',   label: 'This Month' },
              { key: 'last',   label: 'Last Month' },
              { key: 'custom', label: 'Custom' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setMonthFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  monthFilter === f.key
                    ? 'text-white'
                    : 'bg-white dark:bg-white/5 text-gray-400 dark:text-white/30 border border-gray-100 dark:border-white/10'
                }`}
                style={monthFilter === f.key ? { backgroundColor: '#0f2347' } : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Custom Date Range */}
        {monthFilter === 'custom' && searchQuery.length === 0 && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest block mb-1 ml-1">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 outline-none text-sm font-semibold text-gray-700 dark:text-white focus:border-emerald-400 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest block mb-1 ml-1">To</label>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 outline-none text-sm font-semibold text-gray-700 dark:text-white focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Rollover Banner */}
        {rolloverData && (
          <div
            className="rounded-2xl px-5 py-4 flex justify-between items-center"
            style={{ backgroundColor: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.12)' }}
          >
            <div>
              <p className="font-bold text-sm text-orange-700 dark:text-orange-400">Rollover from {rolloverData.fromMonth}</p>
              <p className="text-[9px] text-orange-500 dark:text-orange-400/60 font-bold uppercase tracking-wider mt-0.5">
                Carried forward into this month
              </p>
            </div>
            <p className="font-black text-sm text-orange-700 dark:text-orange-400">{formatZAR(rolloverData.amount)}</p>
          </div>
        )}

        {/* Orders List */}
        {searchQuery.length === 0 && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-8 text-center text-sm text-gray-400 dark:text-white/30 font-medium">
                No transactions found
              </div>
            ) : (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                {filteredOrders.map((order, i) => (
                  <div
                    key={order.id}
                    className={`flex justify-between items-center px-5 py-4 ${
                      i < filteredOrders.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{order.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-tighter">{order.date}</p>
                        {!selectedRestaurant && (
                          <>
                            <span className="text-[10px] text-gray-300 dark:text-white/10">•</span>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-white/30">{order.restaurantName}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{formatZAR(order.amount)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {filteredOrders.length > 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="flex justify-between items-center px-5 py-4 bg-gray-50 dark:bg-white/5">
                  <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Total</p>
                  <p className="font-black text-sm text-[#0f2347] dark:text-emerald-400">{formatZAR(ordersTotal)}</p>
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