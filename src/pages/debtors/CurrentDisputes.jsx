import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { MOCK_DISPUTES } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

const CurrentDisputes = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState(
    [...MOCK_DISPUTES].sort((a, b) => new Date(a.date) - new Date(b.date))
  );
  const [removingId, setRemovingId]     = useState(null);
  const [expandedId, setExpandedId]     = useState(null);
  const [agreedAmounts, setAgreedAmounts] = useState({});

  const handleResolve = id => {
    setRemovingId(id);
    setTimeout(() => {
      setDisputes(prev => prev.filter(d => d.id !== id));
      setExpandedId(null);
      setRemovingId(null);
    }, 400);
  };

  const handleCheckClick = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <MainLayout title="Current Disputes" showBack>
      <div className="max-w-2xl">

        {/* Pending badge */}
        {disputes.length > 0 && (
          <div className="flex items-center justify-end mb-4">
            <div className="bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full animate-pulse">
              {disputes.length} pending
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Check size={36} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">All Clear!</h2>
              <p className="text-sm text-gray-400 mt-1">No pending disputes to resolve.</p>
            </div>
          ) : (
            disputes.map(item => {
              const isExpanded  = expandedId === item.id;
              const agreedAmount = agreedAmounts[item.id] ?? item.amount;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden transition-all duration-500
                    ${removingId === item.id ? 'opacity-0 scale-95 translate-x-10' : 'opacity-100'}`}
                >
                  {/* Main row */}
                  <div className="p-5 flex items-center justify-between gap-4">

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-900 truncate">
                        {item.customer || 'Customer Name'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">
                          {item.order || 'Order Item'}
                        </span>
                        <span className="text-[9px] font-bold text-gray-300">•</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {item.date}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-orange-50 text-orange-600">
                        {item.status || 'Pending'}
                      </span>
                    </div>

                    {/* Amount + check */}
                    <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                      <p className="font-black text-sm text-gray-900">{formatZAR(item.amount)}</p>
                      <button
                        onClick={() => handleCheckClick(item.id)}
                        className={`w-10 h-10 text-white rounded-xl flex items-center justify-center shadow-sm transition-all active:scale-90
                          ${isExpanded ? 'bg-orange-500' : 'bg-green-500'}`}
                      >
                        <Check size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded resolve panel */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">

                      {/* Dispute note */}
                      {item.note && (
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
                          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">
                            Customer's Note
                          </p>
                          <p className="text-sm text-orange-700 font-medium">{item.note}</p>
                        </div>
                      )}

                      {/* Amounts */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Current Amount
                          </p>
                          <p className="text-lg font-black text-gray-900">{formatZAR(item.amount)}</p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">
                            Agreed Amount
                          </p>
                          <input
                            type="number"
                            value={agreedAmount}
                            onChange={e => setAgreedAmounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="w-full bg-transparent text-lg font-black text-green-700 outline-none"
                          />
                        </div>
                      </div>

                      {/* Save */}
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-sm hover:bg-green-700 transition-colors shadow-sm"
                      >
                        Save & Resolve Dispute
                      </button>

                      {/* Cancel */}
                      <button
                        onClick={() => setExpandedId(null)}
                        className="w-full py-3 text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {disputes.length > 0 && (
          <p className="text-center text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em] mt-8">
            Items sorted by priority (Oldest first)
          </p>
        )}

      </div>
    </MainLayout>
  );
};

export default CurrentDisputes;