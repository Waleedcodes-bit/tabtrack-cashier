import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Clock } from 'lucide-react';

import InnerLayout from '../../components/layout/InnerLayout';
import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_PAYMENTS } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

const RecordPayment = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredCustomers = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(c => c.balance > 0);

  const recentPayments = MOCK_PAYMENTS.slice(0, 5).map(p => {
    const customer = MOCK_CUSTOMERS.find(c => c.id === p.customerId);
    return { ...p, customerName: customer?.name, customerCode: customer?.code };
  });

  const currentMonthOrders = selectedCustomer
    ? MOCK_ORDERS.filter(o => {
        const orderMonth = o.date.slice(0, 7);
        const currentMonth = new Date().toISOString().slice(0, 7);
        return o.customerId === selectedCustomer.id && orderMonth === currentMonth;
      })
    : [];

  const paidAmount = parseFloat(amount) || 0;
  const balance = selectedCustomer?.balance || 0;
  const rollover = Math.max(0, balance - paidAmount);

  // — SEARCH SCREEN —
  if (!selectedCustomer) {
    return (
      <InnerLayout title="Record Payment" showBack>
        <div className="space-y-5">

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all font-medium text-sm shadow-sm"
              autoFocus
            />
          </div>

          {/* Search Results */}
          {searchQuery.length > 0 && (
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? (
                <p className="text-center text-gray-400 text-sm font-medium py-8">No accounts found</p>
              ) : (
                filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedCustomer(c); setSearchQuery(''); }}
                    className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all shadow-sm hover:border-green-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{c.name}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-black text-sm text-gray-900">{formatZAR(c.balance)}</p>
                        <p className="text-[9px] font-bold text-red-500 uppercase">Owed</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Recent Payments */}
          {searchQuery.length === 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Recent Payments</p>
              {recentPayments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400 font-medium">
                  No payments recorded yet
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  {recentPayments.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex justify-between items-center px-5 py-4 ${i < recentPayments.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                          <Clock size={14} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{p.customerName}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.customerCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-600">{formatZAR(p.amount_paid)}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{p.payment_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </InnerLayout>
    );
  }

  // — PAYMENT SCREEN —
  return (
    <InnerLayout title="Record Payment" showBack>
      <div className="space-y-4">

        {/* Account Card */}
        <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-xl shadow-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-white text-sm border border-white/5">
                {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-white">{selectedCustomer.name}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{selectedCustomer.code}</p>
              </div>
            </div>
            <button
              onClick={() => { setSelectedCustomer(null); setAmount(''); }}
              className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-lg"
            >
              Change
            </button>
          </div>
          <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 flex justify-between items-center border border-white/5">
            <p className="text-xs text-gray-400 font-medium">Outstanding Balance</p>
            <p className="text-lg font-bold text-white">{formatZAR(balance)}</p>
          </div>
        </div>

        {/* Current Month Transactions */}
        {currentMonthOrders.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">This Month's Orders</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {currentMonthOrders.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center px-5 py-3 ${i < currentMonthOrders.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div>
                    <p className="font-bold text-sm text-gray-900">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.date}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-900">{formatZAR(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-2 ml-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Paid (ZAR)</label>
            <button
              onClick={() => setAmount(String(balance))}
              className="text-[10px] font-black text-green-600 uppercase tracking-wider bg-green-50 px-3 py-1 rounded-lg"
            >
              Pay Full {formatZAR(balance)}
            </button>
          </div>
          <input
  type="number"
  inputMode="decimal"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  className="w-full px-5 py-5 bg-white rounded-2xl border border-gray-100 outline-none text-2xl font-bold text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
  placeholder="0.00"
  autoFocus
/>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 ml-1">Payment Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-green-400 transition-colors"
          />
        </div>

        {/* Rollover Summary */}
        {paidAmount > 0 && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
            <p className="text-orange-600 text-xs font-bold uppercase tracking-tight mb-2">Allocation Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-orange-600/80 font-medium">Rollover to next month</span>
              <span className="font-bold text-orange-700">{formatZAR(rollover)}</span>
            </div>
            {paidAmount > balance && (
              <div className="mt-2 pt-2 border-t border-orange-200 flex justify-between text-xs">
                <span className="text-green-600 font-bold">Credit Balance</span>
                <span className="text-green-600 font-bold">{formatZAR(paidAmount - balance)}</span>
              </div>
            )}
          </div>
        )}

        {/* Confirm Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              alert(`Payment of ${formatZAR(paidAmount)} recorded for ${selectedCustomer.name}`);
              navigate('/dashboard');
            }}
            disabled={paidAmount <= 0}
            className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-[0.98]
              ${paidAmount > 0
                ? 'bg-green-600 text-white shadow-green-200 hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            Confirm Payment
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-4 px-6 uppercase tracking-widest font-bold leading-relaxed">
            Remaining balance will roll over to next month.
          </p>
        </div>
      </div>
    </InnerLayout>
  );
};

export default RecordPayment;