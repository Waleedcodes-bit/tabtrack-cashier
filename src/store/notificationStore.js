// ─── Cashier notifications ─────────────────────────────────────────────────
let listeners = [];
let notifications = [
  {
    id: 1, type: 'payment', unread: true,
    title: 'Payment received',
    body: 'From Thandi Mokoena',
    amount: 'R 320,00', time: '2h ago',
  },
];
let nextId = 10;

export const getNotifications = () => notifications;

export const addNotification = (notif) => {
  const newNotif = { id: nextId++, unread: true, time: 'Just now', ...notif };
  notifications = [newNotif, ...notifications];
  listeners.forEach(fn => fn(notifications));
};

export const subscribe = (fn) => {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
};

// ─── Shared edit requests (cashier → customer) ─────────────────────────────
let editListeners = [];
let editRequests = [];
let nextEditId = 100;

export const getEditRequests = () => editRequests;

export const addEditRequest = (req) => {
  const newReq = {
    id: nextEditId++,
    status: 'pending', // pending | accepted | rejected
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