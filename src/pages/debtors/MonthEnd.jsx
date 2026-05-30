import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle, AlertCircle, X, Lock } from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const MONTH_NAME    = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

const MonthEnd = () => {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount]     = useState('');
  const [payments, setPayments] = useState({});

  const getMonthlyTotal = customerId =>
    MOCK_ORDERS
      .filter(o => o.customerId === customerId && o.date.startsWith(CURRENT_MONTH))
      .reduce((sum, o) => sum + o.amount, 0);

  const getMonthlyOrders = customerId =>
    MOCK_ORDERS.filter(o => o.customerId === customerId && o.date.startsWith(CURRENT_MONTH));

  const paidAmount      = parseFloat(amount) || 0;
  const selectedBalance = selectedCustomer ? getMonthlyTotal(selectedCustomer.id) : 0;
  const rollover        = Math.max(0, selectedBalance - paidAmount);

  const isPaid      = customerId => payments[customerId] !== undefined;
  const unpaidCount = MOCK_CUSTOMERS.filter(c => !isPaid(c.id) && getMonthlyTotal(c.id) > 0).length;
  const canClose    = unpaidCount === 0;

  const handleConfirmPayment = () => {
    setPayments(prev => ({ ...prev, [selectedCustomer.id]: paidAmount }));
    setSelectedCustomer(null);
    setAmount('');
  };

  const handleClose = () => {
    alert(`${MONTH_NAME} has been closed successfully.`);
    navigate('/dashboard');
  };

  // ── Payment Panel (right side on desktop, full page on mobile) ─────────────
  const PaymentPanel = () => {
    const orders = getMonthlyOrders(selectedCustomer.id);
    return (
      <div className="flex flex-col gap-4">
        {/* Account Card */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0f2347 0%, #1a3565 100%)', boxShadow: '0 16px 48px rgba(10,22,40,0.2)' }}
        >
          <div className="absolute top-0 left-6 right-6 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-white">{selectedCustomer.name}</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{selectedCustomer.code}</p>
              </div>
            </div>
            <button onClick={() => { setSelectedCustomer(null); setAmount(''); }}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <X size={14} className="text-white/50" />
            </button>
          </div>
          <div className="rounded-2xl px-4 py-3 flex justify-between items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">{MONTH_NAME} Total</p>
            <p className="text-lg font-black text-white">{formatZAR(selectedBalance)}</p>
          </div>
        </div>

        {/* Orders this month */}
        {orders.length > 0 && (
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Orders This Month</p>
            <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              {orders.map((item, i) => (
                <div key={item.id} className={`flex justify-between items-center px-5 py-3.5 ${i < orders.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.date}</p>
                  </div>
                  <p className="font-black text-sm text-[#0f2347]">{formatZAR(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-2 ml-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount Paid (ZAR)</label>
            <button onClick={() => setAmount(String(selectedBalance))}
              className="text-[10px] font-black text-green-600 uppercase tracking-wider bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors">
              Pay Full
            </button>
          </div>
          <input
            type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full px-5 py-5 bg-white dark:bg-white/5 rounded-2xl outline-none text-2xl font-bold text-gray-900 border border-gray-100 focus:border-green-400 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00" autoFocus
          />
        </div>

        {paidAmount > 0 && rollover > 0 && (
          <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.12)' }}>
            <p className="text-orange-600 text-xs font-black uppercase tracking-tight mb-2">Rollover Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-orange-600/80 font-medium">Carries to next month</span>
              <span className="font-black text-orange-700">{formatZAR(rollover)}</span>
            </div>
          </div>
        )}

        {paidAmount > 0 && paidAmount >= selectedBalance && (
          <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.12)' }}>
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-700 font-medium">Fully settled</span>
              <CheckCircle size={16} className="text-green-600" />
            </div>
          </div>
        )}

        <button
          onClick={handleConfirmPayment} disabled={paidAmount <= 0}
          className="w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98]"
          style={paidAmount > 0
            ? { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#fff', boxShadow: '0 6px 20px rgba(22,163,74,0.2)' }
            : { backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }
          }
        >
          Confirm Payment
        </button>
      </div>
    );
  };

  // ── Desktop: side-by-side. Mobile: full-page payment panel ────────────────
  if (selectedCustomer) {
    return (
      <MainLayout title={`${MONTH_NAME} Close`} showBack>
        {/* Mobile: full page payment */}
        <div className="block lg:hidden max-w-xl">
          <PaymentPanel />
        </div>
        {/* Desktop: keep list on left, payment on right */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6">
          <div className="col-span-3">
            <OverviewContent
              MOCK_CUSTOMERS={MOCK_CUSTOMERS}
              getMonthlyTotal={getMonthlyTotal}
              isPaid={isPaid}
              payments={payments}
              setSelectedCustomer={setSelectedCustomer}
              selectedCustomer={selectedCustomer}
              canClose={canClose}
              unpaidCount={unpaidCount}
              handleClose={handleClose}
            />
          </div>
          <div className="col-span-2">
            <PaymentPanel />
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Main Month End Overview ────────────────────────────────────────────────
  return (
    <MainLayout title={`${MONTH_NAME} Close`} showBack>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts list */}
        <div className="lg:col-span-2">
          <OverviewContent
            MOCK_CUSTOMERS={MOCK_CUSTOMERS}
            getMonthlyTotal={getMonthlyTotal}
            isPaid={isPaid}
            payments={payments}
            setSelectedCustomer={setSelectedCustomer}
            selectedCustomer={selectedCustomer}
            canClose={canClose}
            unpaidCount={unpaidCount}
            handleClose={handleClose}
          />
        </div>

        {/* Right: summary panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 p-5 sticky top-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Month Summary</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-white/5">
                <p className="text-xs text-gray-500 font-medium">Total accounts</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{MOCK_CUSTOMERS.filter(c => getMonthlyTotal(c.id) > 0).length}</p>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-white/5">
                <p className="text-xs text-gray-500 font-medium">Settled</p>
                <p className="text-sm font-black text-green-600">{MOCK_CUSTOMERS.filter(c => isPaid(c.id) && getMonthlyTotal(c.id) > 0).length}</p>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-white/5">
                <p className="text-xs text-gray-500 font-medium">Unpaid</p>
                <p className="text-sm font-black text-red-500">{unpaidCount}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs font-black text-gray-900 uppercase tracking-wider">Total collected</p>
                <p className="text-sm font-black text-[#0f2347]">
                  {formatZAR(Object.values(payments).reduce((s, v) => s + v, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Extracted overview so it can be reused in both views
const OverviewContent = ({ MOCK_CUSTOMERS, getMonthlyTotal, isPaid, payments, setSelectedCustomer, selectedCustomer, canClose, unpaidCount, handleClose }) => (
  <div className="flex flex-col gap-4">
    {/* Status Banner */}
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={canClose
        ? { backgroundColor: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.15)' }
        : { backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }
      }
    >
      {canClose
        ? <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
        : <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
      }
      <div>
        <p className={`text-xs font-black uppercase tracking-wider ${canClose ? 'text-green-700' : 'text-red-600'}`}>
          {canClose ? 'All accounts settled' : `${unpaidCount} account${unpaidCount !== 1 ? 's' : ''} still unpaid`}
        </p>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
          {canClose ? 'Ready to close the month' : 'Cannot close until all are settled'}
        </p>
      </div>
    </div>

    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">All Accounts</p>

    <div className="space-y-2.5">
      {MOCK_CUSTOMERS.map(customer => {
        const monthlyTotal     = getMonthlyTotal(customer.id);
        const paid             = isPaid(customer.id);
        const amountPaid       = payments[customer.id] || 0;
        const customerRollover = Math.max(0, monthlyTotal - amountPaid);
        if (monthlyTotal === 0) return null;

        return (
          <div
            key={customer.id}
            onClick={() => !paid && setSelectedCustomer(customer)}
            className={`bg-white dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between transition-all ${
              !paid ? 'cursor-pointer hover:shadow-md' : ''
            } ${selectedCustomer?.id === customer.id ? 'ring-2 ring-blue-400' : ''}`}
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: paid ? '1px solid rgba(22,163,74,0.2)' : '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                style={{ background: paid ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
              >
                {customer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{customer.name}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{customer.code}</p>
                {paid && customerRollover > 0 && (
                  <p className="text-[9px] font-black text-orange-500 mt-0.5">Rollover: {formatZAR(customerRollover)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`font-black text-sm ${paid ? 'text-green-600' : 'text-red-600'}`}>{formatZAR(monthlyTotal)}</p>
                <p className={`text-[9px] font-black uppercase tracking-tight mt-0.5 ${paid ? 'text-green-500' : 'text-red-500'}`}>
                  {paid ? 'Settled' : 'Unpaid'}
                </p>
              </div>
              {!paid && <ChevronRight size={15} className="text-gray-300" />}
              {paid  && <CheckCircle size={16} className="text-green-500" />}
            </div>
          </div>
        );
      })}
    </div>

    <button
      onClick={handleClose} disabled={!canClose}
      className="w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      style={canClose
        ? { background: 'linear-gradient(135deg, #0f2347 0%, #1a3565 100%)', color: '#fff', boxShadow: '0 8px 24px rgba(15,35,71,0.2)' }
        : { backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }
      }
    >
      <Lock size={15} />
      {canClose ? `Close ${MONTH_NAME}` : `${unpaidCount} Unpaid — Cannot Close`}
    </button>
  </div>
);

export default MonthEnd;