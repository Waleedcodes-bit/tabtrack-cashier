import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ChevronDown } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { formatZAR } from '../../utils/format';

const CUSTOMER_RESTAURANTS = [
  { id: '1', name: 'The Corner Bistro' },
  { id: '2', name: 'The Green Bistro' },
];

const RESTAURANT_ORDERS = {
  '1': [
    { id: 'o1', name: 'Burger & Fries', amount: 120, date: '2026-05-03' },
    { id: 'o2', name: 'Craft Beer x2',  amount: 90,  date: '2026-05-02' },
  ],
  '2': [
    { id: 'o4', name: 'Steak Dinner', amount: 240, date: '2026-05-04' },
    { id: 'o5', name: 'Wine x2',      amount: 80,  date: '2026-05-01' },
  ],
};

const INITIAL_DISPUTES = [
  {
    id: 'd1',
    restaurantId: '1',
    restaurantName: 'The Corner Bistro',
    order: 'Craft Beer x2',
    amount: 90,
    date: '2026-05-02',
    note: 'I only ordered one beer, not two.',
    status: 'Pending',
  },
];

const CustomerDisputes = () => {
  const [searchParams]          = useSearchParams();
  const preselectedRestaurant   = searchParams.get('restaurant') || '';

  const [disputes, setDisputes]                     = useState(INITIAL_DISPUTES);
  const [showForm, setShowForm]                     = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(preselectedRestaurant);
  const [selectedDate, setSelectedDate]             = useState('');
  const [selectedOrder, setSelectedOrder]           = useState('');
  const [note, setNote]                             = useState('');

  const availableDates = selectedRestaurant
    ? [...new Set((RESTAURANT_ORDERS[selectedRestaurant] || []).map(o => o.date))].sort((a, b) => b.localeCompare(a))
    : [];

  const ordersOnDate = selectedRestaurant && selectedDate
    ? (RESTAURANT_ORDERS[selectedRestaurant] || []).filter(o => o.date === selectedDate)
    : [];

  const canSubmit = selectedRestaurant && selectedOrder && note;

  const handleSubmit = () => {
    const order      = ordersOnDate.find(o => o.id === selectedOrder);
    const restaurant = CUSTOMER_RESTAURANTS.find(r => r.id === selectedRestaurant);
    setDisputes(prev => [{
      id: `d${Date.now()}`,
      restaurantId:   selectedRestaurant,
      restaurantName: restaurant?.name,
      order:          order?.name,
      amount:         order?.amount,
      date:           order?.date,
      note,
      status: 'Pending',
    }, ...prev]);
    setShowForm(false);
    setSelectedRestaurant(preselectedRestaurant);
    setSelectedDate('');
    setSelectedOrder('');
    setNote('');
  };

  return (
    <CustomerLayout title="Disputes" showBack>
      <div className="space-y-4">

        {/* Raise Dispute Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            style={{ backgroundColor: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.12)', color: '#c2410c' }}
          >
            <AlertCircle size={16} /> Raise a Dispute
          </button>
        )}

        {/* Raise Dispute Form */}
        {showForm && (
          <div
            className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(234,88,12,0.06)' }}
          >
            {/* Form Header */}
            <div
              className="px-5 py-4 border-b border-orange-50"
              style={{ backgroundColor: 'rgba(234,88,12,0.04)' }}
            >
              <p className="font-black text-sm text-orange-700">New Dispute</p>
              <p className="text-[10px] text-orange-500 font-medium mt-0.5">
                Select the order you want to dispute
              </p>
            </div>

            <div className="p-5 space-y-4">

              {/* Step 1 — Restaurant */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">
                  Step 1 — Restaurant
                </label>
                <div className="relative">
                  <select
                    value={selectedRestaurant}
                    onChange={e => { setSelectedRestaurant(e.target.value); setSelectedDate(''); setSelectedOrder(''); }}
                    className="w-full px-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-orange-400 transition-all appearance-none"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
                    <option value="">Choose restaurant...</option>
                    {CUSTOMER_RESTAURANTS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Step 2 — Date */}
              {selectedRestaurant && (
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">
                    Step 2 — Select Date
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDate}
                      onChange={e => { setSelectedDate(e.target.value); setSelectedOrder(''); }}
                      className="w-full px-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-orange-400 transition-all appearance-none"
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    >
                      <option value="">Choose a date...</option>
                      {availableDates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Step 3 — Order */}
              {selectedDate && (
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">
                    Step 3 — Select Order
                  </label>
                  <div
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
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
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{order.date}</p>
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
                </div>
              )}

              {/* Step 4 — Note */}
              {selectedOrder && (
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 ml-1">
                    Step 4 — Your Note
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Explain the issue e.g. I only ordered one drink, not two..."
                    className="w-full px-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-medium text-gray-700 focus:border-orange-400 transition-all min-h-[100px] resize-none"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowForm(false); setSelectedDate(''); setSelectedOrder(''); setNote(''); }}
                  className="flex-1 py-4 rounded-2xl font-bold text-xs text-gray-400 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]
                    ${canSubmit
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  Submit
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Disputes List */}
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
          My Disputes
        </p>

        {disputes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400 font-medium">
            No disputes raised yet
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map(d => (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-gray-100 p-5"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-black text-sm text-gray-900">{d.order}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                      {d.restaurantName} • {d.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-sm text-gray-900">{formatZAR(d.amount)}</p>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      d.status === 'Resolved'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-orange-50 text-orange-600'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Your Note</p>
                  <p className="text-xs text-gray-600 font-medium">{d.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </CustomerLayout>
  );
};

export default CustomerDisputes;