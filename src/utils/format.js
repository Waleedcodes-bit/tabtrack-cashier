import { supabase } from '../lib/supabase';

export const formatZAR = (amount) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

export const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getCurrentMonthName = () =>
  new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

// Returns the number of orders for a customer in the current month
export const getMonthTransactionCount = async (customerId) => {
  const key = getCurrentMonthKey();
  const start = `${key}-01`;
  const end = `${key}-31`;

  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .gte('date', start)
    .lte('date', end);

  if (error) {
    console.error('getMonthTransactionCount error:', error);
    return 0;
  }
  return count ?? 0;
};

// Returns true if the customer has a payment recorded for the current month
export const isPaidThisMonth = async (customerId) => {
  const key = getCurrentMonthKey();

  const { data, error } = await supabase
    .from('payments')
    .select('id')
    .eq('customer_id', customerId)
    .eq('month', key)
    .limit(1);

  if (error) {
    console.error('isPaidThisMonth error:', error);
    return false;
  }
  return data && data.length > 0;
};