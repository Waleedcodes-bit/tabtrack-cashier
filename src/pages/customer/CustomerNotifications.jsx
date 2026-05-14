import React, { useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { ShoppingBag, AlertTriangle, CheckCircle, Bell, X } from 'lucide-react';

const ALL_NOTIFICATIONS = [
  {
    id: 1, type: 'charge', unread: true,
    title: 'New charge added',
    body: 'The Green Bistro — Chicken wrap',
    amount: 'R 85,00',
    time: 'Just now',
    date: 'Today',
    icon: ShoppingBag, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
  {
    id: 2, type: 'resolved', unread: true,
    title: 'Dispute resolved',
    body: 'The Corner Bistro adjusted your order',
    amount: 'R 45,00',
    time: '1h ago',
    date: 'Today',
    icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
  {
    id: 3, type: 'reminder', unread: false,
    title: 'Month end reminder',
    body: 'Your tab at The Green Bistro is due',
    amount: 'R 320,00',
    time: 'Yesterday',
    date: 'Yesterday',
    icon: AlertTriangle, iconBg: 'bg-orange-50', iconColor: 'text-orange-500',
  },
  {
    id: 4, type: 'charge', unread: false,
    title: 'New charge added',
    body: 'The Corner Bistro — Pap & Chicken',
    amount: 'R 70,00',
    time: 'Yesterday',
    date: 'Yesterday',
    icon: ShoppingBag, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
  {
    id: 5, type: 'dispute', unread: false,
    title: 'Dispute pending',
    body: 'Your dispute is being reviewed',
    amount: null,
    time: '2 days ago',
    date: '11 May',
    icon: AlertTriangle, iconBg: 'bg-orange-50', iconColor: 'text-orange-500',
  },
  {
    id: 6, type: 'charge', unread: false,
    title: 'New charge added',
    body: 'The Green Bistro — Burger & Fries',
    amount: 'R 120,00',
    time: '2 days ago',
    date: '11 May',
    icon: ShoppingBag, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
];

const FILTERS = ['All', 'Charges', 'Disputes', 'Reminders'];

const filterMap = {
  All: () => true,
  Charges: n => n.type === 'charge',
  Disputes: n => n.type === 'dispute' || n.type === 'resolved',
  Reminders: n => n.type === 'reminder',
};

const CustomerNotifications = () => {
  const [items, setItems] = useState(ALL_NOTIFICATIONS);
  const [filter, setFilter] = useState('All');

  const filtered = items.filter(filterMap[filter]);
  const unreadCount = items.filter(n => n.unread).length;

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, unread: false })));
  const dismiss = id => setItems(prev => prev.filter(n => n.id !== id));

  const grouped = filtered.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  return (
    <CustomerLayout title="Notifications" showBack>
      <div className="flex items-center justify-between mb-5">
        {unreadCount > 0 ? (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
            {unreadCount} new
          </span>
        ) : <span />}
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-emerald-600 font-semibold">
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

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
                            {n.unread && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                            <button onClick={() => dismiss(n.id)} className="text-gray-300 hover:text-gray-500">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          {n.amount ? (
                            <span className="text-sm font-bold text-gray-900">{n.amount}</span>
                          ) : <span />}
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
    </CustomerLayout>
  );
};

export default CustomerNotifications;