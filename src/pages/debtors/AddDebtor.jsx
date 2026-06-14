import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, Info } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';

const AddDebtor = () => {
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState('');
  const [foundUser, setFoundUser]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [adding, setAdding]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const handleLookup = async () => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setFoundUser(null);
    setError('');

    // Look up customer profile by their unique code
    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('id, owner_name, email, code, status')
      .eq('code', searchCode.trim().toUpperCase())
      .eq('role', 'customer')
      .single();

    setLoading(false);

    if (lookupError || !profile) {
      setFoundUser('not_found');
      return;
    }

    setFoundUser(profile);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleLookup();
  };

  const handleAddDebtor = async () => {
    if (!foundUser || foundUser === 'not_found') return;
    setAdding(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not logged in.'); setAdding(false); return; }

    // Check if this customer is already linked to this owner
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', foundUser.id)
      .eq('owner_id', user.id)
      .single();

    if (existing) {
      setError('This customer is already linked to your account.');
      setAdding(false);
      return;
    }

    // Generate a unique customer code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TAB-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];

    // Create the customers row linking them to this owner
    const { error: insertError } = await supabase
      .from('customers')
      .insert({
        name:         foundUser.owner_name || 'Customer',
        code,
        balance:      0,
        owner_id:     user.id,
        auth_user_id: foundUser.id,
        joined_date:  new Date().toISOString().split('T')[0],
      });

    if (insertError) {
      setError(insertError.message);
      setAdding(false);
      return;
    }

    setAdding(false);
    setSuccess(true);
    setTimeout(() => navigate('/debtors'), 1500);
  };

  return (
    <MainLayout title="Add Debtor" showBack>
      <div className="max-w-2xl space-y-4">

        {/* Info Banner */}
        <div className="flex gap-3 items-start p-4 rounded-2xl"
          style={{ backgroundColor: 'rgba(15,35,71,0.04)', border: '1px solid rgba(15,35,71,0.08)' }}>
          <Info size={15} className="mt-0.5 flex-shrink-0 text-[#0f2347]" />
          <p className="text-xs font-semibold leading-relaxed text-[#0f2347]">
            Enter the customer's unique App Code to pull their profile automatically.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex gap-2 bg-white rounded-2xl p-2"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <input
            type="text"
            placeholder="Enter code (e.g. CUS-A3X9)"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-3 bg-transparent outline-none text-sm font-black tracking-widest text-gray-900 placeholder:font-medium placeholder:tracking-normal placeholder:text-gray-400"
          />
          <button onClick={handleLookup} disabled={loading}
            className="px-5 py-3 rounded-xl font-black text-white text-xs transition-all active:scale-95 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0f2347, #1a3565)', boxShadow: '0 4px 12px rgba(15,35,71,0.2)' }}>
            <Search size={16} />
          </button>
        </div>

        {/* Not Found */}
        {foundUser === 'not_found' && (
          <div className="p-4 rounded-2xl text-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
            <p className="text-xs font-black text-red-500">No account found for that code.</p>
            <p className="text-[10px] text-red-400 font-semibold mt-0.5">Double-check and try again.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl text-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
            <p className="text-xs font-black text-red-500">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-4 rounded-2xl text-center"
            style={{ backgroundColor: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.12)' }}>
            <p className="text-xs font-black text-green-600">Customer added! Redirecting…</p>
          </div>
        )}

        {/* Found User Card */}
        {foundUser && foundUser !== 'not_found' && !success && (
          <div className="rounded-3xl overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>

            <div className="p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #0f2347 0%, #1a3565 100%)' }}>
              <div className="absolute top-0 left-6 right-6 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.15), transparent 70%)' }} />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {(foundUser.owner_name || 'C')[0]}
                </div>
                <div>
                  <p className="font-black text-white">{foundUser.owner_name || 'Customer'}</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-0.5">{foundUser.code}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 space-y-4">
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#f8fafc', border: '1px solid rgba(0,0,0,0.04)' }}>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-sm font-bold text-gray-900">{foundUser.email || '—'}</p>
              </div>

              <button onClick={handleAddDebtor} disabled={adding}
                className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', boxShadow: '0 6px 20px rgba(22,163,74,0.2)' }}>
                <UserCheck size={17} />
                {adding ? 'Adding…' : 'Confirm & Add to Tab'}
              </button>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default AddDebtor;