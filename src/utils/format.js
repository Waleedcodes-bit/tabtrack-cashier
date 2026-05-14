import { MOCK_ORDERS, MOCK_PAYMENTS } from '../data/mockData';

export const formatZAR = (amount) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

export const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getCurrentMonthName = () =>
  new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

export const getMonthTransactionCount = (customerId) => {
  const key = getCurrentMonthKey();
  return MOCK_ORDERS.filter(o => o.customerId === customerId && o.date.startsWith(key)).length;
};

export const isPaidThisMonth = (customerId) => {
  const key = getCurrentMonthKey();
  return MOCK_PAYMENTS.some(p => p.customerId === customerId && p.month === key);
};