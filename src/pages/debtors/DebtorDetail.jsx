import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, FileText, ChevronRight, AlertTriangle } from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

const DeleteModal = ({ name, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full max-w-sm bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl">
      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
        <Trash2 size={20} className="text-red-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">Delete Debtor?</h3>
      <p className="text-sm text-gray-500 mb-6">
        This will permanently remove <span className="text-gray-900 font-bold">{name}</span> and
        all their transaction history.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onCancel} className="py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-500">
          Cancel
        </button>
        <button onClick={onConfirm} className="py-3 rounded-xl bg-red-50 border border-red-100 text-sm font-bold text-red-500">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const DebtorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);

  const customer = MOCK_CUSTOMERS.find(c => c.id === id);
  const orders   = MOCK_ORDERS.filter(o => o.customerId === id);
  const owing    = customer?.balance > 0;
  const isBlocked = customer?.unsettledPreviousMonth;

  if (!customer) return (
    <MainLayout title="Not Found" showBack>
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-bold text-gray-400">Customer not found</p>
      </div>
    </MainLayout>
  );

  const initials = customer.name.split(' ').map(n => n[0]).join('');

  return (
    <>
      <MainLayout title={customer.name} showBack>
        <div className="max-w-2xl">

          {/* ── Unsettled previous month banner ── */}
          {isBlocked && (
            <div
              className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-5 border border-red-200"
              style={{ backgroundColor: 'rgba(239,68,68,0.06)' }}
            >
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-red-600">Previous month unsettled</p>
                <p className="text-xs text-red-400 font-medium mt-0.5">
                  {formatZAR(customer.previousMonthBalance)} still outstanding from last month.
                  This account is blocked from adding new orders.
                </p>
              </div>
            </div>
          )}

          {/* Profile card */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 mb-5"
            style={{ background: 'linear-gradient(135deg, #0d3d2e, #062a20)', border: '1px solid rgba(16,185,129,0.15)' }}
          >
            <div className="flex flex-col items-center mb-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-black text-xl mb-3">
                {initials}
              </div>
              <h2 className="text-lg font-bold text-white">{customer.name}</h2>
              <p className="text-xs font-bold text-emerald-400/60 uppercase tracking-widest mt-0.5">{customer.code}</p>

              {/* Blocked badge on profile */}
              {isBlocked && (
                <div className="mt-3 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Account Blocked</p>
                </div>
              )}
            </div>

            {/* Balance row */}
            <div
              className="flex items-center justify-between rounded-xl px-5 py-4 relative z-10"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-sm text-emerald-300/60 font-medium">Current Amount Owed</p>
              <p className={`text-xl font-extrabold ${owing ? 'text-orange-400' : 'text-emerald-400'}`}>
                {formatZAR(customer.balance)}
              </p>
            </div>
          </div>

          {/* View statement */}
          <button
            onClick={() => navigate(`/debtor/${id}/history`)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all group mb-5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <FileText size={17} className="text-emerald-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-900">View Full Statement</p>
              <p className="text-xs text-gray-400">All transactions for this debtor</p>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </button>

          {/* Recent transactions */}
          <div className="mb-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Transactions</p>
            {orders.length === 0 ? (
              <div className="py-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center">
                <p className="text-sm font-bold text-gray-400">No transactions yet</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                {orders.slice(0, 5).map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center px-5 py-4 ${
                      i < Math.min(orders.length, 5) - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{item.date}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700">{formatZAR(item.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <div className="border-t border-gray-100 pt-5">
            <button
              onClick={() => setShowDelete(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 border border-red-100 text-sm font-bold text-red-400 hover:bg-red-100 transition-all"
            >
              <Trash2 size={15} /> Delete Debtor Profile
            </button>
          </div>

        </div>
      </MainLayout>

      {showDelete && (
        <DeleteModal
          name={customer.name}
          onCancel={() => setShowDelete(false)}
          onConfirm={() => { setShowDelete(false); navigate('/debtors'); }}
        />
      )}
    </>
  );
};

export default DebtorDetail;