import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Pencil, Clock } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { formatZAR } from '../../utils/format';
import { getEditRequests, resolveEditRequest, subscribeEdits } from '../../store/notificationStore';

const CustomerDisputes = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(getEditRequests());

  useEffect(() => subscribeEdits(setRequests), []);

  const pending  = requests.filter(r => r.status === 'pending');
  const resolved = requests.filter(r => r.status !== 'pending');

  const handleAccept = (id) => resolveEditRequest(id, 'accepted');
  const handleReject = (id) => resolveEditRequest(id, 'rejected');

  return (
    <CustomerLayout title="Disputes" showBack>
      <div className="space-y-6">

        {/* Empty state */}
        {requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-gray-300 dark:text-white/20" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white mb-1">No disputes</p>
            <p className="text-sm text-gray-400 dark:text-white/30">Any cashier edits to your orders will appear here</p>
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-3 ml-1">
              Awaiting your response — {pending.length}
            </p>
            <div className="space-y-3">
              {pending.map(req => (
                <div key={req.id}
                  className="bg-white dark:bg-white/5 rounded-2xl border border-orange-100 dark:border-orange-500/20 overflow-hidden"
                  style={{ boxShadow: '0 2px 12px rgba(234,88,12,0.06)' }}>

                  {/* Header */}
                  <div
                    className="px-5 py-4 border-b border-orange-50 dark:border-orange-500/10"
                    style={{ backgroundColor: 'rgba(234,88,12,0.03)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pencil size={13} className="text-orange-500 dark:text-orange-400" />
                        <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">Amount Edited by Cashier</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
                        <Clock size={10} className="text-orange-500 dark:text-orange-400" />
                        <span className="text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase">Pending</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Order info */}
                    <p className="text-sm font-black text-gray-900 dark:text-white mb-0.5">{req.orderName}</p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-4">
                      {req.restaurantName} • {req.orderDate}
                    </p>

                    {/* Old vs new amount */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-gray-50 dark:bg-white/5 rounded-2xl px-4 py-3 border border-gray-100 dark:border-white/10">
                        <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-wider mb-1">Original</p>
                        <p className="text-lg font-black text-gray-400 dark:text-white/30 line-through">{formatZAR(req.oldAmount)}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl px-4 py-3 border border-blue-100 dark:border-blue-500/20">
                        <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">New Amount</p>
                        <p className="text-lg font-black text-blue-700 dark:text-blue-300">{formatZAR(req.newAmount)}</p>
                      </div>
                    </div>

                    {/* Accept / Reject */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="py-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-sm font-bold text-red-500 dark:text-red-400 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        style={{ boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
                      >
                        <CheckCircle size={15} /> Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolved */}
        {resolved.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3 ml-1">
              Resolved
            </p>
            <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden">
              {resolved.map((req, i) => (
                <div key={req.id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < resolved.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{req.orderName}</p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mt-0.5">
                      {req.restaurantName} • {req.orderDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-700 dark:text-white/70">{formatZAR(req.newAmount)}</p>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${
                      req.status === 'accepted'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </CustomerLayout>
  );
};

export default CustomerDisputes;