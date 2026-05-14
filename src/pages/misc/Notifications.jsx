import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { ShoppingBag, CreditCard, AlertTriangle, CheckCircle, X, Bell } from 'lucide-react';

const ALL_NOTIFICATIONS = [
  {
    id: 1, type: 'order', unread: true,
    title: 'New order created',
    body: 'Burger & Fries under Sipho Dlamini',
    amount: 'R 120,00',
    time: 'Just now',
    date: 'Today',
    icon: ShoppingBag, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
  {
    id: 2, type: 'payment', unread: true,
    title: 'Payment received',
    body: 'From Thandi Mokoena',
    amount: 'R 320,00',
    time: '2h ago',
    date: 'Today',
    icon: CreditCard, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
  },
  {
    id: 3, type: 'order', unread: false,
    title: 'New order created',
    body: 'Pap & Wors under Kamo Sithole',
    amount: 'R 65,00',
    time: '5h ago',
    date: 'Today',
    icon: ShoppingBag, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
  {
    id: 4, type: 'dispute', unread: false,
    title: 'Dispute raised',
    body: 'By Kamo Sithole — order on 3 May',
    amount: null,
    time: '8h ago',
    date: 'Today',
    icon: AlertTriangle, iconBg: 'bg-orange-50', iconColor: 'text-orange-500',
  },
  {
    id: 5, type: 'payment', unread: false,
    title: 'Payment received',
    body: 'From Lerato Nkosi',
    amount: 'R 210,00',
    time: 'Yesterday',
    date: 'Yesterday',
    icon: CreditCard, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
  },
  {
    id: 6, type: 'resolved', unread: false,
    title: 'Dispute resolved',
    body: 'Order adjusted for Lerato Nkosi',
    amount: 'R 85,00',
    time: 'Yesterday',
    date: 'Yesterday',
    icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
  {
    id: 7, type: 'order', unread: false,
    title: 'New order created',
    body: 'Cheese Burger under Sipho Dlamini',
    amount: 'R 95,00',
    time: '2 days ago',
    date: '11 May',
    icon: ShoppingBag, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
  {
    id: 8, type: 'payment', unread: false,
    title: 'Payment received',
    body: 'From Thandi Mokoena',
    amount: 'R 450,00',
    time: '2 days ago',
    date: '11 May',
    icon: CreditCard, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
  },
];

const FILTERS = ['All', 'Orders', 'Payments', 'Disputes'];

const filterMap = {
  All: () => true,
  Orders: n => n.type === 'order',
  Payments: n => n.type === 'payment',
  Disputes: n => n.type === 'dispute' || n.type === 'resolved',
};

const Notifications = () => {
  const [items, setItems] = useState(ALL_NOTIFICATIONS);
  const [filter, setFilter] = useState('All');

  const filtered = items.filter(filterMap[filter]);
  const unreadCount = items.filter(n => n.unread).length;

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, unread: false })));
  const dismiss = id => setItems(prev => prev.filter(n => n.id !== id));

  // Group by date
  const grouped = filtered.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  return (
    <MainLayout title="Notifications" showBack>
      <div className="max-w-2xl mx-auto">

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-emerald-600 font-semibold hover:text-emerald-700"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grouped notifications */}
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Bell size={24} className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-900 mb-1">No notifications</p>
            <p className="text-sm text-gray-400">Nothing here yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, notifs]) => (
              <div key={date}>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">{date}</p>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50"
                  style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                  {notifs.map(n => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                          n.unread ? 'bg-emerald-50/40' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${n.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon size={17} className={n.iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {n.unread && (
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              )}
                              <button
                                onClick={() => dismiss(n.id)}
                                className="text-gray-300 hover:text-gray-500 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            {n.amount ? (
                              <span className="text-sm font-bold text-gray-900">{n.amount}</span>
                            ) : (
                              <span />
                            )}
                            <span className="text-[11px] text-gray-400">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;