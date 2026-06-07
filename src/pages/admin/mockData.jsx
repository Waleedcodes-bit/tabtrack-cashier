// src/pages/admin/mockData.js
// Central mock data store — replace with API calls / context when going live.

export const mockStats = {
  totalAccounts:     142,
  cashiers:          38,
  customers:         104,
  activeAccounts:    129,
  suspendedAccounts: 13,
  totalRevenue:      28450,
  pendingFees:       3200,
  openIssues:        11,
  resolvedIssues:    87,
  totalTabs:         312,
  settledTabs:       268,
};

export const mockCashiers = [
  { id: 1, name: "The Corner Bistro",  owner: "James Mokoena",  type: "restaurant", email: "james@cornerbistro.co.za",  status: "active",    customers: 14, fee: 199, feeStatus: "paid",    joined: "Jan 2025", revenue: 2786, openTabs: 4 },
  { id: 2, name: "Green Garden Café",  owner: "Priya Naidoo",   type: "restaurant", email: "priya@greengarden.co.za",   status: "active",    customers: 9,  fee: 199, feeStatus: "overdue", joined: "Feb 2025", revenue: 1890, openTabs: 2 },
  { id: 3, name: "Quick Stop Spaza",   owner: "Thabo Dlamini",  type: "shop",       email: "thabo@quickstop.co.za",     status: "suspended", customers: 3,  fee: 99,  feeStatus: "overdue", joined: "Mar 2025", revenue: 450,  openTabs: 0 },
  { id: 4, name: "Mama's Kitchen",     owner: "Fatima Kareem",  type: "restaurant", email: "fatima@mamaskitchen.co.za", status: "active",    customers: 22, fee: 199, feeStatus: "paid",    joined: "Nov 2024", revenue: 4120, openTabs: 7 },
  { id: 5, name: "Blue Horizon Grill", owner: "Sipho Khumalo",  type: "restaurant", email: "sipho@bluehorizon.co.za",   status: "active",    customers: 11, fee: 199, feeStatus: "paid",    joined: "Dec 2024", revenue: 3340, openTabs: 3 },
  { id: 6, name: "Corner Tuck Shop",   owner: "Ayasha Pillay",  type: "shop",       email: "ayasha@cornertuck.co.za",   status: "active",    customers: 6,  fee: 99,  feeStatus: "paid",    joined: "Apr 2025", revenue: 780,  openTabs: 1 },
];

export const mockCustomers = [
  { id: 1, name: "John Doe",          email: "john@gmail.com",   status: "active",    tabs: 2, totalOwed: 770.50,  linkedTo: ["The Corner Bistro", "Green Garden Café"],                 joined: "Feb 2025" },
  { id: 2, name: "Sarah Williams",    email: "sarah@gmail.com",  status: "active",    tabs: 1, totalOwed: 320.00,  linkedTo: ["Mama's Kitchen"],                                         joined: "Jan 2025" },
  { id: 3, name: "Mike van der Berg", email: "mike@gmail.com",   status: "active",    tabs: 3, totalOwed: 1200.00, linkedTo: ["Corner Bistro", "Blue Horizon Grill", "Mama's Kitchen"],  joined: "Mar 2025" },
  { id: 4, name: "Lerato Sithole",    email: "lerato@gmail.com", status: "suspended", tabs: 0, totalOwed: 0,       linkedTo: [],                                                         joined: "Apr 2025" },
  { id: 5, name: "Ahmed Hassan",      email: "ahmed@gmail.com",  status: "active",    tabs: 1, totalOwed: 450.50,  linkedTo: ["Green Garden Café"],                                      joined: "Jan 2025" },
];

export const mockFeedback = [
  { id: 1, from: "John Doe",       type: "customer", subject: "Incorrect charge on my tab",  message: "I was charged R150 for a meal I didn't order on 2 June. Please review my tab at The Corner Bistro.", status: "open",     date: "2025-06-02", priority: "high",   reply: "" },
  { id: 2, from: "James Mokoena", type: "cashier",  subject: "QR code not scanning",          message: "Our QR code printout stopped working after the last app update. Customers can't link.",               status: "resolved", date: "2025-05-28", priority: "medium", reply: "We've regenerated your QR code. Please reprint from your dashboard settings." },
  { id: 3, from: "Priya Naidoo",  type: "cashier",  subject: "Monthly report not generating", message: "The May month-end report shows blank data even though I have 9 customers with tabs.",                 status: "open",     date: "2025-06-01", priority: "high",   reply: "" },
  { id: 4, from: "Sarah Williams",type: "customer", subject: "Can't see my tab history",      message: "My tab history only shows the last 3 transactions. I need full history for a dispute.",               status: "open",     date: "2025-06-03", priority: "low",    reply: "" },
  { id: 5, from: "Sipho Khumalo", type: "cashier",  subject: "Feature request: bulk settle",  message: "It would be great to settle multiple tabs at once at month end rather than one by one.",              status: "resolved", date: "2025-05-20", priority: "low",    reply: "Thanks for the suggestion! We've added this to our product roadmap for Q3 2025." },
];

export const mockPayments = [
  { cashier: "The Corner Bistro",  month: "May 2025", amount: 199, status: "paid",    date: "2025-05-01", method: "EFT"  },
  { cashier: "Green Garden Café",  month: "May 2025", amount: 199, status: "overdue", date: "-",          method: "-"    },
  { cashier: "Quick Stop Spaza",   month: "May 2025", amount: 99,  status: "overdue", date: "-",          method: "-"    },
  { cashier: "Mama's Kitchen",     month: "May 2025", amount: 199, status: "paid",    date: "2025-05-03", method: "Card" },
  { cashier: "Blue Horizon Grill", month: "May 2025", amount: 199, status: "paid",    date: "2025-05-02", method: "EFT"  },
  { cashier: "Corner Tuck Shop",   month: "May 2025", amount: 99,  status: "paid",    date: "2025-05-05", method: "EFT"  },
  { cashier: "The Corner Bistro",  month: "Jun 2025", amount: 199, status: "pending", date: "-",          method: "-"    },
  { cashier: "Mama's Kitchen",     month: "Jun 2025", amount: 199, status: "pending", date: "-",          method: "-"    },
];
