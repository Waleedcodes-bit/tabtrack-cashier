import { useState, useEffect } from "react";
import { Icon, StatusBadge } from "./Shared.jsx";
import { supabase } from '../../lib/supabase';

export default function PaymentsPage() {
  const [tab, setTab] = useState("all");
  const [payments, setPayments] = useState([]);
  const [cashierCount, setCashierCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
    fetchCashierCount();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("cashier_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cashier payments:", error);
      setLoading(false);
      return;
    }

    setPayments(data || []);
    setLoading(false);
  }

  async function fetchCashierCount() {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner");

    setCashierCount(count || 0);
  }

  const filtered = payments.filter((p) => tab === "all" || p.status === tab);

  const totalCollected = payments.filter((p) => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0);
  const totalOverdue   = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending   = payments.filter((p) => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);

  const markPaid = async (target) => {
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("cashier_payments")
      .update({ status: "paid", date: today, method: "Manual" })
      .eq("id", target.id);

    if (error) {
      console.error("Error marking payment as paid:", error);
      return;
    }

    setPayments((prev) =>
      prev.map((p) =>
        p.id === target.id ? { ...p, status: "paid", date: today, method: "Manual" } : p
      )
    );
  };

  return (
    <div>
      {/* ── KPI stats ── */}
      <div className="stat-grid section-gap">
        {[
          { label: "COLLECTED (MAY)", value: `R${totalCollected.toLocaleString()}`, color: "#1db87a", bg: "rgba(29,184,122,0.1)", icon: "check",   cls: "green", sub: `${payments.filter((p) => p.status === "paid").length} payments` },
          { label: "OVERDUE",         value: `R${totalOverdue.toLocaleString()}`,   color: "#e53535", bg: "rgba(229,53,53,0.1)",  icon: "alert",   cls: "red",   sub: `${payments.filter((p) => p.status === "overdue").length} cashiers` },
          { label: "PENDING (JUN)",   value: `R${totalPending.toLocaleString()}`,   color: "#eab308", bg: "rgba(234,179,8,0.1)", icon: "bell",                  sub: `${payments.filter((p) => p.status === "pending").length} awaiting` },
          { label: "TOTAL CASHIERS",  value: cashierCount,                          color: "#3b82f6", bg: "rgba(59,130,246,0.1)",icon: "cashier",               sub: "On platform" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <Icon name={s.icon} size={18} />
            </div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.cls || ""}`}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Payment allocations table ── */}
      <div className="card section-gap">
        <div className="card-header">
          <div>
            <div className="card-title">Payment Allocations</div>
            <div className="card-sub">Monthly fee tracking per cashier</div>
          </div>
          <button className="btn btn-outline btn-sm">
            <Icon name="download" size={13} />
            Export CSV
          </button>
        </div>

        <div style={{ padding: "12px 20px 12px", borderBottom: "1px solid var(--border2)", display: "flex", gap: 6 }}>
          {["all", "paid", "overdue", "pending"].map((t) => (
            <button
              key={t}
              className={`pill-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
              style={{ margin: 0, textTransform: "capitalize", fontSize: 12, padding: "5px 14px" }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">
              <p>Loading payments…</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cashier</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date Paid</th>
                  <th>Method</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <Icon name="payments" size={28} />
                        <p>No payments in this view.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.cashier}</td>
                      <td style={{ color: "var(--text-mid)" }}>{p.month}</td>
                      <td style={{ fontWeight: 700 }}>R{(p.amount || 0).toLocaleString()}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td style={{ color: "var(--text-light)", fontSize: 12 }}>{p.date || "—"}</td>
                      <td style={{ color: "var(--text-mid)" }}>{p.method || "—"}</td>
                      <td>
                        {p.status === "overdue" && (
                          <button className="btn btn-sm btn-primary" onClick={() => markPaid(p)}>Mark Paid</button>
                        )}
                        {p.status === "paid"    && <span style={{ fontSize: 12, color: "var(--text-light)" }}>Settled</span>}
                        {p.status === "pending" && <span style={{ fontSize: 12, color: "var(--text-light)" }}>Awaiting</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Per-cashier fee summary ── */}

    </div>
  );
}