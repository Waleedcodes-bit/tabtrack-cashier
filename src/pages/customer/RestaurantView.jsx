import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { formatZAR } from '../../utils/format';

const LAST_MONTH = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

const RESTAURANT_DATA = {
  '1': {
    name: 'The Corner Bistro',
    code: 'TCB-001',
    balance: 450.50,
    rollover: 240.50,
    orders: [
      { id: 'o1', name: 'Burger & Fries', amount: 120, date: '2026-05-03' },
      { id: 'o2', name: 'Craft Beer x2',  amount: 90,  date: '2026-05-02' },
    ],
  },
  '2': {
    name: 'The Green Bistro',
    code: 'TGB-002',
    balance: 320.00,
    rollover: 0,
    orders: [
      { id: 'o3', name: 'Steak Dinner', amount: 240, date: '2026-05-04' },
      { id: 'o4', name: 'Wine x2',      amount: 80,  date: '2026-05-01' },
    ],
  },
};

const RestaurantView = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const restaurant = RESTAURANT_DATA[id];

  if (!restaurant) return (
    <CustomerLayout title="Not Found" showBack>
      <div className="text-center py-20 text-gray-400 font-medium text-sm">Restaurant not found</div>
    </CustomerLayout>
  );

  const ordersTotal = restaurant.orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <CustomerLayout title={restaurant.name} showBack>

      {/* Balance Card */}
      <div
        className="rounded-2xl p-6 mb-5 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
      >
        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.1), transparent 70%)' }}
        />
        <div className="relative z-10 flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {restaurant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{restaurant.name}</p>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">{restaurant.code}</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 mb-1">
            Current Balance
          </p>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {formatZAR(restaurant.balance)}
          </h2>
        </div>
      </div>

      {/* Rollover Banner */}
      {restaurant.rollover > 0 && (
        <div
          className="rounded-2xl px-5 py-4 flex justify-between items-center mb-4"
          style={{ backgroundColor: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.12)' }}
        >
          <div>
            <p className="font-bold text-sm text-orange-700">Rollover from {LAST_MONTH}</p>
            <p className="text-[9px] text-orange-500 font-bold uppercase tracking-wider mt-0.5">
              Carried forward from last month
            </p>
          </div>
          <p className="font-black text-sm text-orange-700">{formatZAR(restaurant.rollover)}</p>
        </div>
      )}

      {/* This Month's Orders */}
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
        This Month's Orders
      </p>

      {restaurant.orders.length === 0 ? (
        <div
          className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400 font-medium mb-4"
        >
          No orders this month
        </div>
      ) : (
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          {restaurant.orders.map((order, i) => (
            <div
              key={order.id}
              className={`flex justify-between items-center px-5 py-4 ${
                i < restaurant.orders.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div>
                <p className="font-bold text-sm text-gray-900">{order.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                  {order.date}
                </p>
              </div>
              <p className="font-bold text-sm text-gray-900">{formatZAR(order.amount)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        {restaurant.rollover > 0 && (
          <div className="flex justify-between items-center px-5 py-3 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rollover</p>
            <p className="font-bold text-sm text-orange-600">{formatZAR(restaurant.rollover)}</p>
          </div>
        )}
        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">This Month</p>
          <p className="font-bold text-sm text-gray-900">{formatZAR(ordersTotal)}</p>
        </div>
        <div className="flex justify-between items-center px-5 py-4 bg-gray-50">
          <p className="text-xs font-black text-gray-900 uppercase tracking-wider">Total Owed</p>
          <p className="font-black text-sm text-[#0f2347]">{formatZAR(restaurant.balance)}</p>
        </div>
      </div>

      {/* Raise Dispute */}
      <button
        onClick={() => navigate(`/customer/disputes?restaurant=${id}`)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all"
        style={{ backgroundColor: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.12)', color: '#c2410c' }}
      >
        <AlertCircle size={15} /> Raise a Dispute
      </button>

    </CustomerLayout>
  );
};

export default RestaurantView;