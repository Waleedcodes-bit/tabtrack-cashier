export const MOCK_CUSTOMERS = [
  { id: '1', name: 'John Doe', code: 'JD-001', balance: 450.50, joinedDate: '2025-01-15', monthlyTransactions: { '2025-10': 8, '2025-04': 3 } },
  { id: '2', name: 'Sarah Smith', code: 'SS-002', balance: 0, joinedDate: '2025-02-20', monthlyTransactions: { '2025-10': 12, '2025-04': 4 } },
  { id: '3', name: 'Mike Ross', code: 'MR-003', balance: 1200.00, joinedDate: '2025-03-05', monthlyTransactions: { '2025-10': 15, '2025-04': 6 } },
  { id: '4', name: 'Lebo Dlamini', code: 'LD-004', balance: 320.00, joinedDate: '2025-04-10', monthlyTransactions: { '2025-04': 5 } },
];

export const MOCK_ORDERS = [
  { id: 't1', customerId: '1', name: 'Burger & Fries', amount: 120, date: '2026-05-03' },
  { id: 't2', customerId: '1', name: 'Craft Beer x2', amount: 90, date: '2026-05-02' },
  { id: 't3', customerId: '1', name: 'Steak Dinner', amount: 240.50, date: '2026-04-22' },
  { id: 't4', customerId: '3', name: 'Whiskey Double', amount: 85, date: '2026-05-01' },
  { id: 't5', customerId: '3', name: 'Ribs Platter', amount: 310, date: '2026-05-04' },
];

export const MOCK_DISPUTES = [
  { id: 'd1', customerId: '3', customer: 'Mike Ross', order: 'Whiskey Double', amount: 85, date: '2026-05-01', note: 'I only ordered a single.' },
];

export const MOCK_PAYMENTS = [
  { id: 'p1', customerId: '2', amount: 320, date: '2026-04-30', month: '2026-04' },
];