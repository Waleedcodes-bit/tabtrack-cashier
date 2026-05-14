import React, { useState } from 'react';
import { Search, X, ArrowUpRight } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_PAYMENTS } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

const TODAY         = new Date().toISOString().split('T')[0];
const CURRENT_MONTH = TODAY.slice(0, 7);
const LAST_MONTH    = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

const TransactionHistory = () => {
  const [filter, setFilter]                     = useState('All');
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [accountFilter, setAccountFilter]       = useState('This Month');
  const [specificDay, setSpecificDay]           = useState('');

  // Custom date range for main view
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]     = useState('');

  const getFilteredOrders = () => {
    const orders = [...MOCK_ORDERS];
    if (filter === 'Today')      return orders.filter(o => o.date === TODAY);
    if (filter === 'This Month') return orders.filter(o => o.date.startsWith(CURRENT_MONTH));
    if (filter === 'Custom') {
      if (customFrom && customTo) return orders.filter(o => o.date >= customFrom && o.date <= customTo);
      if (customFrom)             return orders.filter(o => o.date >= customFrom);
      if (customTo)               return orders.filter(o => o.date <= customTo);
    }
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  const searchResults = searchQuery.length > 0
    ? MOCK_CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getAccountOrders = () => {
    let orders = MOCK_ORDERS.filter(o => o.customerId === selectedCustomer.id);
    if (accountFilter === 'This Month') return orders.filter(o => o.date.startsWith(CURRENT_MONTH));
    if (accountFilter === 'Last Month') return orders.filter(o => o.date.startsWith(LAST_MONTH));
    if (accountFilter === 'This Week') {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return orders.filter(o => new Date(o.date) >= weekAgo);
    }
    if (accountFilter === 'Day' && specificDay) return orders.filter(o => o.date === specificDay);
    return orders;
  };

  const getRollover = () => {
    const payment = MOCK_PAYMENTS.find(
      p => p.customerId === selectedCustomer.id && p.month === LAST_MONTH
    );
    return payment?.rollover_amount || 0;
  };

  // ── Account Detail View ────────────────────────────────────────────────────
  if (selectedCustomer) {
    const accountOrders    = getAccountOrders();
    const rollover         = getRollover();
    const ordersTotal      = accountOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalOutstanding = rollover + ordersTotal;

    return (
      <MainLayout title={selectedCustomer.name} showBack>
        <div className="max-w-2xl">

          {/* Account Header Card */}
          <div
            className="rounded-3xl p-5 mb-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #0f2347 0%, #1a3565 100%)',
              boxShadow: '0 16px 48px rgba(10,22,40,0.2)',
            }}
          >
            <div className="absolute top-0 left-6 right-6 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.12), transparent 70%)' }} />

            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{selectedCustomer.name}</p>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">
                    {selectedCustomer.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedCustomer(null); setSearchQuery(''); setAccountFilter('This Month'); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <X size={14} className="text-white/50" />
              </button>
            </div>

            <div
              className="relative z-10 rounded-2xl px-4 py-3 flex justify-between items-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Total Outstanding</p>
              <p className="text-lg font-black text-white">{formatZAR(totalOutstanding)}</p>
            </div>
          </div>

          {/* Account Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
            {['This Month', 'Last Month', 'This Week', 'Day', 'All'].map(t => (
              <button
                key={t}
                onClick={() => setAccountFilter(t)}
                className="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all"
                style={accountFilter === t
                  ? { backgroundColor: '#0f2347', color: '#fff' }
                  : { backgroundColor: '#fff', color: '#9ca3af', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
                }
              >
                {t}
              </button>
            ))}
          </div>

          {accountFilter === 'Day' && (
            <input
              type="date"
              value={specificDay}
              onChange={e => setSpecificDay(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-2xl text-sm font-semibold text-gray-700 outline-none mb-4 border border-gray-100"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            />
          )}

          {/* Rollover Banner */}
          {(accountFilter === 'This Month' || accountFilter === 'All') && rollover > 0 && (
            <div
              className="rounded-2xl px-5 py-4 flex justify-between items-center mb-3"
              style={{ backgroundColor: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.12)' }}
            >
              <div>
                <p className="font-bold text-sm text-orange-700">Rollover from {LAST_MONTH}</p>
                <p className="text-[9px] text-orange-500 font-black uppercase tracking-wider mt-0.5">Carried forward</p>
              </div>
              <p className="font-black text-sm text-orange-700">{formatZAR(rollover)}</p>
            </div>
          )}

          {/* Orders */}
          {accountOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400 font-medium border border-gray-100">
              No transactions found
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden mb-3 border border-gray-100"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              {accountOrders.map((order, i) => (
                <div
                  key={order.id}
                  className={`flex justify-between items-center px-5 py-4 ${
                    i < accountOrders.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm text-gray-900">{order.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{order.date}</p>
                  </div>
                  <p className="font-black text-sm text-gray-900">{formatZAR(order.amount)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Summary Card */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            {rollover > 0 && (accountFilter === 'This Month' || accountFilter === 'All') && (
              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rollover</p>
                <p className="font-bold text-sm text-orange-600">{formatZAR(rollover)}</p>
              </div>
            )}
            <div className="flex justify-between items-center px-5 py-3 border-b border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orders Total</p>
              <p className="font-bold text-sm text-gray-900">{formatZAR(ordersTotal)}</p>
            </div>
            <div className="flex justify-between items-center px-5 py-4 bg-gray-50">
              <p className="text-xs font-black text-gray-900 uppercase tracking-wider">Total Outstanding</p>
              <p className="font-black text-sm text-[#0f2347]">{formatZAR(totalOutstanding)}</p>
            </div>
          </div>

        </div>
      </MainLayout>
    );
  }

  // ── Main History View ──────────────────────────────────────────────────────
  return (
    <MainLayout title="Transactions" showBack>
      <div className="max-w-2xl">

        {/* Date Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Today', 'This Month', 'Custom'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all"
              style={filter === t
                ? { backgroundColor: '#0f2347', color: '#fff' }
                : { backgroundColor: '#fff', color: '#9ca3af', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Custom Date Range Pickers */}
        {filter === 'Custom' && (
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">
                From
              </label>
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-green-400 focus:ring-4 focus:ring-green-500/5 transition-all"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">
                To
              </label>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-green-400 focus:ring-4 focus:ring-green-500/5 transition-all"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              />
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search account by name or code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white rounded-2xl text-sm outline-none font-medium text-gray-700"
            style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          />
        </div>

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <div className="space-y-2 mb-5">
            {searchResults.length === 0 ? (
              <p className="text-center text-gray-400 text-sm font-medium py-6">No accounts found</p>
            ) : (
              searchResults.map(c => (
                <div
                  key={c.id}
                  onClick={() => { setSelectedCustomer(c); setSearchQuery(''); }}
                  className="bg-white p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:shadow-md transition-all"
                  style={{ border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs"
                      style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}
                    >
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{c.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.code}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-gray-300" />
                </div>
              ))
            )}
          </div>
        )}

        {/* Orders List */}
        {searchQuery.length === 0 && (
          <div className="space-y-2.5">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400 border border-gray-100">
                {filter === 'Custom' && !customFrom && !customTo
                  ? 'Select a date range above to filter transactions'
                  : 'No transactions found'}
              </div>
            ) : (
              filteredOrders.map(order => {
                const customer = MOCK_CUSTOMERS.find(c => c.id === order.customerId);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100"
                    style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{order.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{order.date}</p>
                      </div>
                      <p className="font-black text-sm text-[#0f2347]">{formatZAR(order.amount)}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}
                      >
                        {customer?.name?.[0] || 'U'}
                      </div>
                      <span className="text-[11px] font-bold text-gray-400">{customer?.name || 'Unknown'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default TransactionHistory;