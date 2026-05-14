import React from 'react';
import { useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

const DebtorHistory = () => {
  const { id } = useParams();
  const customer = MOCK_CUSTOMERS.find(c => c.id === id);
  const orders   = MOCK_ORDERS.filter(o => o.customerId === id);

  const groupedOrders = orders.reduce((groups, order) => {
    const monthYear = new Date(order.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(order);
    return groups;
  }, {});

  const months = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));
  const monthTotal = month => groupedOrders[month].reduce((sum, o) => sum + o.amount, 0);

  if (!customer) return (
    <MainLayout title="Not Found" showBack>
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-bold text-gray-400">History not found</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout title="Transaction History" showBack>
      <div className="max-w-2xl">

        {/* Customer header */}
        <div
          className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 mb-6"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}
          >
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
              <div
                className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center"
              >
                <Calendar size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-400">No transaction history found</p>
            </div>
          ) : (
            months.map(month => (
              <div key={month}>

                {/* Month header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      {month}
                    </span>
                    <div className="h-px w-8 bg-gray-200" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    {formatZAR(monthTotal(month))}
                  </span>
                </div>

                {/* Transactions */}
                <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  {groupedOrders[month].map((order, i) => (
                    <div
                      key={order.id}
                      className={`flex items-center gap-4 px-5 py-4 ${
                        i < groupedOrders[month].length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      {/* Day badge */}
                      <div
                        className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0"
                      >
                        <span className="text-xs font-black text-gray-500">
                          {new Date(order.date).getDate()}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{order.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                          Ref #{order.id.slice(0, 5).toUpperCase()}
                        </p>
                      </div>

                      {/* Amount */}
                      <p className="text-sm font-bold text-gray-700 flex-shrink-0">
                        {formatZAR(order.amount)}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default DebtorHistory;