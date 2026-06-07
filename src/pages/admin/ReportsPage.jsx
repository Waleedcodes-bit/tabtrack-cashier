import { useState, useEffect } from "react";
import { Icon } from "./Shared";
import { supabase } from '../../lib/supabase';

export default function ReportsPage() {
  const monthlyRevenue = [42, 58, 45, 71, 63, 88, 75, 92, 68, 85, 78, 95];
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];
  const maxRev = Math.max(...monthlyRevenue);

  const [cashiers, setCashiers]       = useState([]);
  const [customers, setCustomers]     = useState([]);
  const [payments, setPayments]       = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchCashiers(), fetchCustomers(), fetchPayments()]);
    setLoading(false);
  }

  // ── Cashiers (owners) with revenue ──────────────────────────────────────────
  async function fetchCashiers() {
    const { data: owners, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "owner");

    if (error) { console.error("fetchCashiers:", error); return; }

    const enriched = await Promise.all(
      (owners || []).map(async (owner) => {
        // get customer ids for this owner
        const { data: ownerCustomers } = await supabase
          .from("customers")
          .select("id")
          .eq("owner_id", owner.id);

        const customerIds = (ownerCustomers || []).map((c) => c.id);

        let revenue = 0;
        if (customerIds.length > 0) {
          const { data: orderData } = await supabase
            .from("orders")
            .select("amount")
            .in("customer_id", customerIds);
          revenue = (orderData || []).reduce((sum, o) => sum + (o.amount || 0), 0);
        }

        return {
          id: owner.id,
          name: owner.business_name || owner.owner_name || "Unnamed Business",
          status: owner.status || "active",
          fee: owner.fee || 0,
          feeStatus: owner.fee_status || "paid",
          revenue,
        };
      })
    );

    setCashiers(enriched);
    setTotalRevenue(enriched.reduce((s, c) => s + c.revenue, 0));
  }

  // ── Customers with balances ──────────────────────────────────────────────────
  async function fetchCustomers() {
    // Fetch customers with their orders and payments to compute balance
    const { data: custs, error } = await supabase
      .from("customers")
      .select("id, name, balance, owner_id");

    if (error) { console.error("fetchCustomers:", error); return; }

    // For each customer get their owner's business name (linkedTo)
    const { data: owners } = await supabase
      .from("profiles")
      .select("id, business_name, owner_name")
      .eq("role", "owner");

    const ownerMap = {};
    (owners || []).forEach((o) => {
      ownerMap[o.id] = o.business_name || o.owner_name || "Unknown";
    });

    // Fetch profiles for customers to get email and status
    const { data: custProfiles } = await supabase
      .from("profiles")
      .select("id, email, status, code")
      .eq("role", "customer");

    const profileMap = {};
    (custProfiles || []).forEach((p) => { profileMap[p.code] = p; });

    const enriched = await Promise.all(
      (custs || []).map(async (c) => {
        // Count open tabs (orders) for this customer
        const { count: tabCount } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("customer_id", c.id);

        return {
          id: c.id,
          name: c.name,
          totalOwed: c.balance || 0,
          tabs: tabCount || 0,
          linkedTo: c.owner_id ? [ownerMap[c.owner_id] || "Unknown"] : [],
        };
      })
    );

    setCustomers(enriched);
  }

  // ── Payments (fee payments from profiles) ───────────────────────────────────
  // The payments table tracks customer tab payments; fee payments are tracked
  // via fee_status on profiles. We reconstruct a fee-payment list from profiles.
  async function fetchPayments() {
    const { data: owners, error } = await supabase
      .from("profiles")
      .select("id, business_name, owner_name, fee, fee_status, created_at")
      .eq("role", "owner");

    if (error) { console.error("fetchPayments:", error); return; }

    const now = new Date();
    const monthLabel = now.toLocaleString("default", { month: "short", year: "numeric" });

    const rows = (owners || []).map((o) => ({
      cashier:  o.business_name || o.owner_name || "Unnamed",
      month:    monthLabel,
      amount:   o.fee || 0,
      status:   o.fee_status || "pending",
      date:     o.fee_status === "paid" ? (o.created_at ? o.created_at.slice(0, 10) : "-") : "-",
      method:   o.fee_status === "paid" ? "EFT" : "-",
    }));

    setPayments(rows);
  }

  // ── Derived totals ───────────────────────────────────────────────────────────
  const totalCollected = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalOverdue   = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const totalPending   = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  if (loading) {
    return (
      <div className="empty-state" style={{ marginTop: 60 }}>
        <p>Loading reports…</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── KPI ── */}
      <div className="stat-grid section-gap">
        {[
          { label: "TOTAL REVENUE",   value: `R${totalRevenue.toLocaleString()}`,  icon: "payments", color: "#1db87a", bg: "rgba(29,184,122,0.1)", cls: "green" },
          { label: "COLLECTED",       value: `R${totalCollected}`,                 icon: "check",    color: "#1db87a", bg: "rgba(29,184,122,0.1)", cls: "green" },
          { label: "OVERDUE",         value: `R${totalOverdue}`,                   icon: "alert",    color: "#e53535", bg: "rgba(229,53,53,0.1)",  cls: "red"   },
          { label: "PENDING",         value: `R${totalPending}`,                   icon: "refresh",  color: "#eab308", bg: "rgba(234,179,8,0.1)"               },
          { label: "ACTIVE CASHIERS", value: cashiers.filter((c) => c.status === "active").length, icon: "cashier", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
          { label: "TOTAL CUSTOMERS", value: customers.length,                     icon: "users",    color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <Icon name={s.icon} size={18} />
            </div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.cls || ""}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Revenue chart + Cashier breakdown ── */}
      <div className="two-col section-gap">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Revenue</div>
              <div className="card-sub">Jul 2024 — Jun 2025</div>
            </div>
            <span className="info-chip">
              <Icon name="chart" size={12} />
              R{totalRevenue.toLocaleString()}
            </span>
          </div>
          <div style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
              {monthlyRevenue.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%",
                    height: `${(v / maxRev) * 100}px`,
                    background: i === 11 ? "var(--green)" : "rgba(29,184,122,0.25)",
                    borderRadius: "3px 3px 0 0",
                  }} />
                  <span style={{ fontSize: 9, color: "var(--text-light)" }}>{months[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue by Cashier</div>
            <div className="card-sub">All time earnings per account</div>
          </div>
          <div style={{ padding: "16px 22px" }}>
            {cashiers.length === 0 ? (
              <div className="empty-state"><p>No cashier data yet.</p></div>
            ) : (
              cashiers.map((c, i) => {
                const maxR = Math.max(...cashiers.map((x) => x.revenue), 1);
                return (
                  <div key={i} className="overview-row">
                    <span className="overview-label" style={{ fontSize: 12 }}>{c.name}</span>
                    <div className="overview-bar">
                      <div
                        className="overview-bar-fill"
                        style={{ width: `${(c.revenue / maxR) * 100}%`, background: "var(--green)" }}
                      />
                    </div>
                    <span className="overview-val" style={{ color: "var(--green)" }}>R{c.revenue.toLocaleString()}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Fee collection table ── */}
      <div className="card section-gap">
        <div className="card-header">
          <div>
            <div className="card-title">Fee Collection</div>
            <div className="card-sub">Monthly subscription payments</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge badge-green"><span className="badge-dot" />R{totalCollected} collected</span>
            <span className="badge badge-red"><span className="badge-dot" />R{totalOverdue} overdue</span>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cashier</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date Paid</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state"><p>No payment records yet.</p></div>
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{p.cashier}</td>
                    <td style={{ color: "var(--text-mid)" }}>{p.month}</td>
                    <td style={{ fontWeight: 600 }}>R{p.amount}</td>
                    <td>
                      <span className={`badge ${
                        p.status === "paid"    ? "badge-green"  :
                        p.status === "overdue" ? "badge-red"    : "badge-yellow"
                      }`}>
                        <span className="badge-dot" />
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-light)", fontSize: 12 }}>{p.date}</td>
                    <td style={{ color: "var(--text-mid)" }}>{p.method}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Customer outstanding ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Customer Outstanding Balances</div>
            <div className="card-sub">Amounts owed across all tabs</div>
          </div>
          <span className="info-chip">
            R{customers.reduce((s, c) => s + c.totalOwed, 0).toLocaleString()} total
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Open Tabs</th>
                <th>Amount Owed</th>
                <th>Linked To</th>
              </tr>
            </thead>
            <tbody>
              {customers.filter((c) => c.totalOwed > 0).length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state"><p>No outstanding balances.</p></div>
                  </td>
                </tr>
              ) : (
                customers.filter((c) => c.totalOwed > 0).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                    </td>
                    <td>{c.tabs}</td>
                    <td style={{ fontWeight: 700, color: "#e53535" }}>R{c.totalOwed.toFixed(2)}</td>
                    <td style={{ fontSize: 12, color: "var(--text-light)" }}>{c.linkedTo.join(", ")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}