import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import { MOCK_CUSTOMERS, MOCK_DISPUTES } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

const Debtors = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredDebtors = MOCK_CUSTOMERS.filter(debtor => {
    const matchesSearch =
      debtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debtor.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'Owing')   return matchesSearch && debtor.balance > 0;
    if (filter === 'Settled') return matchesSearch && debtor.balance === 0;
    return matchesSearch;
  });

  const disputeCount = MOCK_DISPUTES.length;

  return (
   
    <MainLayout title="Debtors" showBack
    
      title="Active Debtors"
      rightAction={
        disputeCount > 0 ? (
          <button
            onClick={() => navigate('/disputes')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
            style={{ backgroundColor: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.15)' }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">Disputes</span>
            <span className="text-white text-[9px] font-black w-4 h-4 rounded-md flex items-center justify-center"
              style={{ backgroundColor: '#ea580c' }}>
              {disputeCount}
            </span>
          </button>
        ) : null
      }
    >
      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search name or code..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white rounded-2xl text-sm outline-none transition-all font-medium text-gray-700"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {['All', 'Owing', 'Settled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-black transition-all"
            style={filter === f
              ? { backgroundColor: '#0f2347', color: '#fff' }
              : { backgroundColor: '#fff', color: '#9ca3af', border: '1px solid rgba(0,0,0,0.06)' }
            }
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            {filteredDebtors.length} shown
          </span>
        </div>
      </div>

      {/* Debtors List */}
      <div className="space-y-2.5">
        {filteredDebtors.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium text-sm">No debtors found</p>
          </div>
        ) : (
          filteredDebtors.map(debtor => (
            <div
              key={debtor.id}
              onClick={() => navigate(`/debtor/${debtor.id}`)}
              className="bg-white rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition-all"
              style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)' }}
                >
                  {debtor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{debtor.name}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                    {debtor.code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-black text-sm text-gray-900">{formatZAR(debtor.balance)}</p>
                  <p className={`text-[9px] font-black uppercase tracking-tight mt-0.5 ${
                    debtor.balance > 0 ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {debtor.balance > 0 ? 'Owing' : 'Settled'}
                  </p>
                </div>
                <ChevronRight size={15} className="text-gray-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
};

export default Debtors;