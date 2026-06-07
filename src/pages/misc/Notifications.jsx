import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { ShoppingBag, CreditCard, Pencil, Bell, X } from 'lucide-react';
import { getNotifications, subscribe } from '../../store/notificationStore';

const iconMap = {
  order:   { icon: ShoppingBag, bg: 'bg-emerald-50 dark:bg-emerald-500/10', color: 'text-emerald-600 dark:text-emerald-400' },
  payment: { icon: CreditCard,  bg: 'bg-blue-50 dark:bg-blue-500/10',       color: 'text-blue-600 dark:text-blue-400'       },
  edit:    { icon: Pencil,      bg: 'bg-blue-50 dark:bg-blue-500/10',        color: 'text-blue-500 dark:text-blue-400'       },
};

const FILTERS = ['All', 'Orders', 'Payments', 'Edits'];
const filterMap = {
  All:      () => true,
  Orders:   n => n.type === 'order',
  Payments: n => n.type === 'payment',
  Edits:    n => n.type === 'edit',
};

const Notifications = () => {
  const [items, setItems]   = useState(getNotifications());
  const [filter, setFilter] = useState('All');

  useEffect(() => subscribe(setItems), []);

  const filtered    = items.filter(filterMap[filter]);
  const unreadCount = items.filter(n => n.unread).length;

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, unread: false })));
  const dismiss     = id => setItems(prev => prev.filter(n => n.id !== id));

  const grouped = filtered.reduce((acc, n) => {
    const key = n.date || 'Today';
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <MainLayout title="Notifications" showBack>
      <div className="max-w-2xl">
        
        <div className="flex items-center justify-between mb-5">
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
              {unreadCount} new
            </span>
          )}
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold ml-auto">
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-gray-900 dark:bg-white/10 text-white border border-transparent dark:border-white/10'
                  : 'bg-white dark:bg-white/5 text-gray-500 dark:text-white/30 border border-gray-100 dark:border-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center mb-3">
              <Bell size={24} className="text-gray-300 dark:text-white/20" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white mb-1">No notifications</p>
            <p className="text-sm text-gray-400 dark:text-white/30">Nothing here yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, notifs]) => (
              <div key={date}>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">{date}</p>
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
                  {notifs.map(n => {
                    const meta = iconMap[n.type] || iconMap.order;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                          n.unread
                            ? 'bg-emerald-50/40 dark:bg-emerald-500/5'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon size={17} className={meta.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                              <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">{n.body}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {n.unread && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                              <button onClick={() => dismiss(n.id)} className="text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/40">
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            {n.amount
                              ? <span className="text-sm font-bold text-gray-900 dark:text-white">{n.amount}</span>
                              : <span />}
                            <span className="text-[11px] text-gray-400 dark:text-white/30">{n.time}</span>
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