import { supabase } from '../lib/supabase';

// ─── Cashier notifications ─────────────────────────────────────────────────

export const addNotification = async ({ user_id, type, title, body, amount }) => {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id, type, title, body, amount });

  if (error) console.error('addNotification error:', error);
};

// ─── Shared edit requests (cashier → customer) ─────────────────────────────
let editListeners = [];
let editRequests  = [];
let nextEditId    = 100;

export const getEditRequests = () => editRequests;

export const addEditRequest = (req) => {
  const newReq = {
    id: nextEditId++,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...req,
  };
  editRequests = [newReq, ...editRequests];
  editListeners.forEach(fn => fn(editRequests));
  return newReq;
};

export const resolveEditRequest = (id, status) => {
  editRequests = editRequests.map(r => r.id === id ? { ...r, status } : r);
  editListeners.forEach(fn => fn(editRequests));
};

export const subscribeEdits = (fn) => {
  editListeners.push(fn);
  return () => { editListeners = editListeners.filter(l => l !== fn); };
};