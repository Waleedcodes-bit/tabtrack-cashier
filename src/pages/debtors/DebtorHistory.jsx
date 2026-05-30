import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Pencil, X, Check } from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '../../data/mockData';
import { formatZAR } from '../../utils/format';
import { addNotification, addEditRequest } from '../../store/notificationStore';

const DebtorHistory = () => {
  const { id } = useParams();
  const customer = MOCK_CUSTOMERS.find(c => c.id === id);
  const [orders, setOrders] = useState(MOCK_ORDERS.filter(o => o.customerId === id));
  const [editingOrder, setEditingOrder] = useState(null);
  const [newAmount, setNewAmount] = useState('');

  const groupedOrders = orders.reduce((groups, order) => {
    const monthYear = new Date(order.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(order);
    return groups;
  }, {});

  const months = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));
  const monthTotal = month => groupedOrders[month].reduce((sum, o) => sum + o.amount, 0);

  const openEdit = (order) => {
    setEditingOrder(order);
    setNewAmount(String(order.amount));
  };

  const handleSaveEdit = () => {
    const oldAmount = editingOrder.amount;
    const updated = parseFloat(newAmount);
    if (isNaN(updated) || updated === oldAmount) { setEditingOrder(null); return; }

    // Update order in state
    setOrders(prev => prev.map(o =>
      o.id === editingOrder.id ? { ...o, amount: updated } : o
    ));

    // Notify cashier feed
    addNotification({
      type: 'edit',
      title: 'Order amount updated',
      body: `${editingOrder.name} changed from ${formatZAR(oldAmount)} to ${formatZAR(updated)}`,
      amount: formatZAR(updated),
    });

    // Send to customer disputes
    addEditRequest({
      orderId:        editingOrder.id,
      orderName:      editingOrder.name,
      orderDate:      editingOrder.date,
      restaurantName: 'The Corner Bistro', // in production: from auth context
      customerId:     id,
      customerName:   customer.name,
      oldAmount,
      newAmount:      updated,
    });

    setEditingOrder(null);
  };

  if (!customer) return (
    <MainLayout title="Not Found" showBack>
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-bold text-gray-400">History not found</p>
      </div>
    </MainLayout>
  );

  return (
    <>
      <MainLayout title="Transaction History" showBack>
        <div className="max-w-2xl">

          {/* Customer header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 mb-6"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}>
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{customer.name}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{customer.code}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance</p>
              <p className={`text-sm font-extrabold ${customer.balance > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                {formatZAR(customer.balance)}
              </p>
            </div>
          </div>

          {/* Grouped transactions */}
          <div className="space-y-6">
            {months.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Calendar size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">No transaction history found</p>
              </div>
            ) : (
              months.map(month => (
                <div key={month}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{month}</span>
                      <div className="h-px w-8 bg-gray-200" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      {formatZAR(monthTotal(month))}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {groupedOrders[month].map((order, i) => (
                      <div key={order.id}
                        className={`flex items-center gap-4 px-5 py-4 ${
                          i < groupedOrders[month].length - 1 ? 'border-b border-gray-50' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-black text-gray-500">
                            {new Date(order.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{order.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                            Ref #{order.id.slice(0, 5).toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="text-sm font-bold text-gray-700">{formatZAR(order.amount)}</p>
                          <button onClick={() => openEdit(order)}
                            className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-blue-50 hover:border-blue-100 transition-all">
                            <Pencil size={13} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </MainLayout>

      {/* Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-base font-black text-gray-900">Edit Amount</p>
              <button onClick={() => setEditingOrder(null)} className="text-gray-300 hover:text-gray-500">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-5">
              {editingOrder.name} • {editingOrder.date}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Current</p>
                <p className="text-lg font-black text-gray-400">{formatZAR(editingOrder.amount)}</p>
              </div>
              <div className="bg-blue-50 rounded-2xl px-4 py-3 border border-blue-100">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-1">New Amount</p>
                <input
                  type="number"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  className="w-full bg-transparent text-lg font-black text-blue-700 outline-none"
                  autoFocus
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium text-center mb-4">
              The customer will be notified and must accept this change
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setEditingOrder(null)}
                className="py-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-500">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!newAmount || parseFloat(newAmount) === editingOrder.amount}
                className={`py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                  ${newAmount && parseFloat(newAmount) !== editingOrder.amount
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <Check size={15} /> Save & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebtorHistory;