import React, { useState } from 'react';
import { CheckCircle, Clock, Edit3 } from 'lucide-react';
import { MOCK_DISPUTES } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

const DebtorDisputes = ({ customerId }) => {
  const [resolvedIds, setResolvedIds] = useState([]);

  // 1. Filter by customer (if provided) and remove resolved items
  // 2. Sort by date: Earliest to Latest
  const activeDisputes = MOCK_DISPUTES
    .filter(d => !resolvedIds.includes(d.id))
    .filter(d => customerId ? d.customerId === customerId : true)
    .sort((a, b) => new Date(a.date) - new Date(b) - new Date(a.date)); // Sort: Earliest first

  if (activeDisputes.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1">
        Action Required: Flagged Invoices
      </p>
      
      {activeDisputes.map((d) => (
        <div 
          key={d.id} 
          className="bg-white p-4 rounded-2xl border border-orange-100 flex justify-between items-center shadow-sm"
        >
          {/* LEFT: Debtor and Order Name */}
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm">{d.customerName || 'Unknown Debtor'}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              {d.order} • {d.date}
            </p>
          </div>

          {/* MIDDLE: Status (Pending or Edit) */}
          <div className="flex-1 flex justify-center">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${
              d.status === 'Edit' 
                ? 'bg-blue-50 border-blue-100 text-blue-600' 
                : 'bg-orange-50 border-orange-100 text-orange-600'
            }`}>
              {d.status === 'Edit' ? <Edit3 size={10} /> : <Clock size={10} />}
              <span className="text-[9px] font-black uppercase">{d.status || 'Pending'}</span>
            </div>
          </div>

          {/* RIGHT: Amount and Resolve Button */}
          <div className="flex-1 flex flex-col items-end gap-2">
            <p className="font-black text-sm text-gray-900">{formatZAR(d.amount)}</p>
            <button 
              onClick={() => setResolvedIds([...resolvedIds, d.id])}
              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
            >
              <CheckCircle size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DebtorDisputes;