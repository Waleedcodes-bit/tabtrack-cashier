import { supabase } from '../lib/supabase';

// ─── Notifications (both cashier and customer) ─────────────────────────────
export const addNotification = async ({ user_id, type, title, body, amount }) => {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id, type, title, body, amount });
  if (error) console.error('addNotification error:', error);
};

// ─── Edit requests (cashier → customer) — persisted to Supabase ───────────
export const addEditRequest = async ({
  orderId,
  customerId,
  oldAmount,
  newAmount,
}) => {
  const { data, error } = await supabase
    .from('order_edits')
    .insert({
      order_id:    orderId,
      customer_id: customerId,
      old_amount:  oldAmount,
      new_amount:  newAmount,
      status:      'pending',
    })
    .select()
    .single();

  if (error) console.error('addEditRequest error:', error);
  return data;
};

export const resolveEditRequest = async (id, status) => {
  const { error } = await supabase
    .from('order_edits')
    .update({ status })
    .eq('id', id);
  if (error) console.error('resolveEditRequest error:', error);
};