import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

const RaiseDispute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [note, setNote] = useState('');

  const customer      = MOCK_CUSTOMERS.find(c => c.id === id);
  const orders        = MOCK_ORDERS.filter(o => o.customerId === id);
  const availableDates = [...new Set(orders.map(o => o.date))].sort((a, b) => b.localeCompare(a));
  const ordersOnDate  = selectedDate ? orders.filter(o => o.date === selectedDate) : [];

  return (
    <MainLayout title="Raise Dispute" showBack>
      <div className="max-w-2xl space-y-5">

        {/* Warning Banner */}
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3">
          <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-orange-700 leading-relaxed">
            You are flagging a transaction for{' '}
            <strong>{customer?.name}</strong>. This will deduct the amount from
            their balance once approved.
          </p>
        </div>

        {/* Step 1 — Select Date */}
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">
            Step 1 — Select Date
          </label>
          <select
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setSelectedOrder(''); }}
            className="w-full px-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-orange-400 transition-all appearance-none"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <option value="">Choose a date...</option>
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>

        {/* Step 2 — Select Order */}
        {selectedDate && (
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">
              Step 2 — Select Order
            </label>
            {ordersOnDate.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-400 font-medium">
                No orders found on this date
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {ordersOnDate.map((order, i) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order.id)}
                    className={`flex justify-between items-center px-5 py-4 cursor-pointer transition-all
                      ${i < ordersOnDate.length - 1 ? 'border-b border-gray-50' : ''}
                      ${selectedOrder === order.id
                        ? 'bg-orange-50 border-l-4 border-l-orange-400'
                        : 'hover:bg-gray-50'}`}
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-900">{order.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                        {order.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-sm text-gray-900">{formatZAR(order.amount)}</p>
                      {selectedOrder === order.id && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Reason */}
        {selectedOrder && (
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">
              Step 3 — Reason for Dispute
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Customer says they didn't order the second drink..."
              className="w-full px-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-medium text-gray-700 focus:border-orange-400 transition-all min-h-[120px] resize-none"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={() => {
            alert('Dispute Raised Successfully');
            navigate(`/debtor/${id}`);
          }}
          disabled={!selectedOrder || !note}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all mt-2
            ${(!selectedOrder || !note)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-100'}`}
        >
          Flag Transaction
        </button>

      </div>
    </MainLayout>
  );
};

export default RaiseDispute;