export const MOCK_CUSTOMERS = [
  { id: '1', name: 'John Doe',      code: 'JD-001', balance: 450.50,  joinedDate: '2025-01-15', unsettledPreviousMonth: true,  previousMonthBalance: 210.00 },
  { id: '2', name: 'Sarah Smith',   code: 'SS-002', balance: 0,       joinedDate: '2025-02-20', unsettledPreviousMonth: false, previousMonthBalance: 0      },
  { id: '3', name: 'Mike Ross',     code: 'MR-003', balance: 1200.00, joinedDate: '2025-03-05', unsettledPreviousMonth: true,  previousMonthBalance: 395.00 },
  { id: '4', name: 'Lebo Dlamini',  code: 'LD-004', balance: 320.00,  joinedDate: '2025-04-10', unsettledPreviousMonth: false, previousMonthBalance: 0      },
];

export const MOCK_ORDERS = [
  { id: 't1', customerId: '1', customerName: 'John Doe',  name: 'Burger & Fries', amount: 120,    date: '2026-05-25' },
  { id: 't2', customerId: '1', customerName: 'John Doe',  name: 'Craft Beer x2',  amount: 90,     date: '2026-05-26' },
  { id: 't3', customerId: '1', customerName: 'John Doe',  name: 'Steak Dinner',   amount: 240.50, date: '2026-04-22' },
  { id: 't4', customerId: '3', customerName: 'Mike Ross', name: 'Whiskey Double', amount: 85,     date: '2026-05-27' },
  { id: 't5', customerId: '3', customerName: 'Mike Ross', name: 'Ribs Platter',   amount: 310,    date: '2026-05-28' },
];

export const MOCK_PAYMENTS = [
  { id: 'p1', customerId: '2', customerName: 'Sarah Smith', amount: 320, date: '2026-05-26', month: '2026-05' },
];