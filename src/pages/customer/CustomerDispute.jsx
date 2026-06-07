import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Pencil, Clock } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { formatZAR } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { sendPushNotification } from '../../utils/pushNotifications';

const TABS = ['Pending', 'Accepted', 'Rejected'];

const FOUR_MONTHS_AGO = new Date();
FOUR_MONTHS_AGO.setMonth(FOUR_MONTHS_AGO.getMonth() - 4);

const CustomerDisputes = () => {
  const [requests, setRequests]   = useState([]);
  const [activeTab, setActiveTab] = useState('Pending');
  const [loading, setLoading]     = useState(true);
  // owner_id → { id, business_name }

  const fetchEdits = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: customerRows } = await supabase
      .from('customers')
      .select('id, owner_id')
      .eq('auth_user_id', user.id);

    if (!customerRows || customerRows.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const customerIds = customerRows.map(r => r.id);
    const ownerIds    = customerRows.map(r => r.owner_id).filter(Boolean);

    const { data: owners } = await supabase
      .from('profiles')
      .select('id, business_name, owner_name')
      .in('id', ownerIds);

    const oMap = {};
    (owners || []).forEach(o => {
      oMap[o.id] = { id: o.id, business_name: o.business_name || o.owner_name || 'Unknown' };
    });
    

    const customerOwnerMap = {};
    customerRows.forEach(r => { customerOwnerMap[r.id] = r.owner_id; });

    const { data: edits, error } = await supabase
      .from('order_edits')
      .select(`
        id,
        order_id,
        customer_id,
        old_amount,
        new_amount,
        status,
        created_at,
        orders (
          id,
          name,
          date
        )
      `)
      .in('customer_id', customerIds)
      .order('created_at', { ascending: false });

    if (error) { console.error('fetchEdits:', error); setLoading(false); return; }

    const enriched = (edits || []).map(e => ({
      id:             e.id,
      orderId:        e.order_id,
      customerId:     e.customer_id,
      ownerId:        customerOwnerMap[e.customer_id],
      orderName:      e.orders?.name || 'Order',
      orderDate:      e.orders?.date || null,
      restaurantName: oMap[customerOwnerMap[e.customer_id]]?.business_name || 'Unknown',
      oldAmount:      e.old_amount,
      newAmount:      e.new_amount,
      status:         e.status,
      createdAt:      e.created_at,
    }));

    setRequests(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEdits();
  }, [fetchEdits]);

  const handleAccept = async (id) => {
    const edit = requests.find(r => r.id === id);
    if (!edit) return;

    const { error: editError } = await supabase
      .from('order_edits')
      .update({ status: 'accepted' })
      .eq('id', id);

    if (editError) { console.error('handleAccept:', editError); return; }

    const { error: orderError } = await supabase
      .from('orders')
      .update({ amount: edit.newAmount })
      .eq('id', edit.orderId);

    if (orderError) { console.error('handleAccept order update:', orderError); return; }

    const diff = edit.newAmount - edit.oldAmount;
    const { data: customer } = await supabase
      .from('customers')
      .select('balance')
      .eq('id', edit.customerId)
      .single();

    if (customer) {
      await supabase
        .from('customers')
        .update({ balance: (customer.balance || 0) + diff })
        .eq('id', edit.customerId);
    }

    // Notify cashier that dispute was accepted
    if (edit.ownerId) {
      await sendPushNotification({
        userId: edit.ownerId,
        title:  'Dispute accepted',
        body:   `${edit.orderName} — amount changed to ${formatZAR(edit.newAmount)}`,
        url:    '/debtors',
      });
    }

    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r)
    );
  };

  const handleReject = async (id) => {
    const edit = requests.find(r => r.id === id);
    if (!edit) return;

    const { error } = await supabase
      .from('order_edits')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) { console.error('handleReject:', error); return; }

    // Notify cashier that dispute was rejected
    if (edit.ownerId) {
      await sendPushNotification({
        userId: edit.ownerId,
        title:  'Dispute rejected',
        body:   `${edit.orderName} — original amount ${formatZAR(edit.oldAmount)} kept`,
        url:    '/debtors',
      });
    }

    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r)
    );
  };

  const isWithin4Months = (dateStr) => {
    if (!dateStr) return true;
    return new Date(dateStr) >= FOUR_MONTHS_AGO;
  };

  const pending  = requests.filter(r => r.status === 'pending');
  const accepted = requests.filter(r => r.status === 'accepted' && isWithin4Months(r.orderDate));
  const rejected = requests.filter(r => r.status === 'rejected' && isWithin4Months(r.orderDate));

  const counts   = { Pending: pending.length, Accepted: accepted.length, Rejected: rejected.length };
  const tabItems = activeTab === 'Pending' ? pending : activeTab === 'Accepted' ? accepted : rejected;

  const emptyMessages = {
    Pending:  'No pending disputes',
    Accepted: 'No accepted disputes in the last 4 months',
    Rejected: 'No rejected disputes in the last 4 months',
  };

  return (
    <CustomerLayout title="Disputes" showBack>
      <div className="space-y-5">

        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? tab === 'Pending'
                    ? 'bg-orange-500 text-white'
                    : tab === 'Accepted'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-white dark:bg-white/5 text-gray-400 dark:text-white/30 border border-gray-100 dark:border-white/10'
              }`}
            >
              {tab}
              {counts[tab] > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40'
                }`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-gray-400 dark:text-white/30 font-medium">Loading disputes…</p>
          </div>
        )}

        {!loading && tabItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-gray-300 dark:text-white/20" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white mb-1">{emptyMessages[activeTab]}</p>
            <p className="text-sm text-gray-400 dark:text-white/30">
              {activeTab === 'Pending'
                ? 'Any cashier edits to your orders will appear here'
                : 'Nothing to show here yet'}
            </p>
          </div>
        )}

        {!loading && activeTab === 'Pending' && tabItems.length > 0 && (
          <div className="space-y-3">
            {tabItems.map(req => (
              <div key={req.id}
                className="bg-white dark:bg-white/5 rounded-2xl border border-orange-100 dark:border-orange-500/20 overflow-hidden"
                style={{ boxShadow: '0 2px 12px rgba(234,88,12,0.06)' }}>

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
                  <p className="text-sm font-black text-gray-900 dark:text-white mb-0.5">{req.orderName}</p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-4">
                    {req.restaurantName} • {req.orderDate || '—'}
                  </p>

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
        )}

        {!loading && activeTab !== 'Pending' && tabItems.length > 0 && (
          <div>
            <p className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest mb-3 ml-1">
              Showing last 4 months
            </p>
            <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden">
              {tabItems.map((req, i) => (
                <div key={req.id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < tabItems.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{req.orderName}</p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mt-0.5">
                      {req.restaurantName} • {req.orderDate || '—'}
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