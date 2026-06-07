import { useState, useEffect } from "react";
import { Icon, StatusBadge } from "./Shared.jsx";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const dashStyles = `
  .dash-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .dash-stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; display: flex; flex-direction: column; gap: 4px; box-shadow: var(--shadow); transition: box-shadow 0.2s; }
  .dash-stat-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
  .dash-stat-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; flex-shrink: 0; }
  .dash-stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; color: var(--text-light); text-transform: uppercase; }
  .dash-stat-value { font-size: 28px; font-weight: 700; color: var(--text); line-height: 1.1; font-family: var(--font-sans); }
  .dash-stat-value.green { color: var(--green); }
  .dash-stat-value.red   { color: #e53535; }
  .dash-stat-delta { font-size: 12px; color: var(--text-light); margin-top: 2px; }
  .dash-stat-delta.green { color: var(--green); }
  .dash-stat-delta.red   { color: #e53535; }
  .dash-body { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
  .dash-left { display: flex; flex-direction: column; gap: 16px; }
  .dash-table-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--border2); }
  .dash-search { display: flex; align-items: center; gap: 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 7px 12px; font-size: 13px; color: var(--text-light); min-width: 200px; transition: border-color 0.15s; }
  .dash-search:focus-within { border-color: var(--green); color: var(--text); }
  .dash-search input { border: none; background: none; outline: none; font-size: 13px; color: var(--text); font-family: var(--font-sans); width: 100%; }
  .dash-search input::placeholder { color: var(--text-light); }
  .dash-toolbar-right { display: flex; align-items: center; gap: 8px; }
  .dash-table { width: 100%; border-collapse: collapse; }
  .dash-table th { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; color: var(--text-light); text-transform: uppercase; padding: 10px 18px; text-align: left; border-bottom: 1px solid var(--border2); white-space: nowrap; }
  .dash-table td { padding: 13px 18px; border-bottom: 1px solid var(--border2); font-size: 13.5px; color: var(--text); vertical-align: middle; }
  .dash-table tbody tr:last-child td { border-bottom: none; }
  .dash-table tbody tr { transition: background 0.12s; cursor: pointer; }
  .dash-table tbody tr:hover { background: var(--bg3); }
  .dash-client-name { font-weight: 600; font-size: 13.5px; color: var(--text); }
  .dash-client-sub { font-size: 11px; color: var(--text-light); margin-top: 1px; }
  .dash-outstanding { font-weight: 600; color: #e53535; }
  .dash-outstanding.zero { color: var(--text-light); }
  .dash-last-activity { font-size: 12px; color: var(--text-light); }
  .dash-table-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1px solid var(--border2); font-size: 12px; color: var(--text-light); }
  .dash-right { display: flex; flex-direction: column; gap: 16px; }
  .dash-side-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
  .dash-side-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border2); }
  .dash-side-title { font-size: 13.5px; font-weight: 600; color: var(--text); }
  .dash-view-all { font-size: 11.5px; color: var(--green); cursor: pointer; font-weight: 500; background: none; border: none; font-family: var(--font-sans); padding: 0; }
  .dash-view-all:hover { text-decoration: underline; }
  .dash-activity-item { display: flex; align-items: flex-start; gap: 10px; padding: 11px 16px; border-bottom: 1px solid var(--border2); transition: background 0.12s; }
  .dash-activity-item:last-child { border-bottom: none; }
  .dash-activity-item:hover { background: var(--bg3); }
  .dash-activity-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .dash-activity-body { flex: 1; min-width: 0; }
  .dash-activity-msg { font-size: 12.5px; color: var(--text); line-height: 1.4; font-weight: 500; }
  .dash-activity-sub { font-size: 11px; color: var(--text-light); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dash-activity-time { font-size: 11px; color: var(--text-light); flex-shrink: 0; margin-top: 2px; }
  .dash-fees-body { padding: 14px 16px; }
  .dash-fees-amount { font-size: 26px; font-weight: 700; color: #e53535; line-height: 1; margin-bottom: 4px; }
  .dash-fees-sub { font-size: 12px; color: var(--text-light); margin-bottom: 14px; }
  .dash-sparkline { width: 100%; height: 36px; opacity: 0.6; }
  @media (max-width: 900px) {
    .dash-stat-grid { grid-template-columns: repeat(2, 1fr); }
    .dash-body { grid-template-columns: 1fr; }
    .dash-right { flex-direction: row; flex-wrap: wrap; }
    .dash-side-card { flex: 1 1 260px; }
  }
  @media (max-width: 540px) {
    .dash-stat-grid { grid-template-columns: 1fr 1fr; }
  }
`;

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isToday) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('en-ZA');
}

const iconColors = {
  user:    { bg: "rgba(29,184,122,0.12)",  color: "var(--green)" },
  payment: { bg: "rgba(59,130,246,0.12)",  color: "#3b82f6"      },
  alert:   { bg: "rgba(229,53,53,0.12)",   color: "#e53535"      },
  success: { bg: "rgba(29,184,122,0.12)",  color: "var(--green)" },
  money:   { bg: "rgba(234,179,8,0.12)",   color: "#eab308"      },
};

export default function DashboardPage() {
  const [search, setSearch]   = useState("");
  const navigate              = useNavigate();

  const [stats, setStats]         = useState({ total: 0, active: 0, suspended: 0, customers: 0, revenue: 0, pendingFees: 0, openIssues: 0 });
  const [cashiers, setCashiers]   = useState([]);
  const [activity, setActivity]   = useState([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);

    // Owners
    const { data: owners } = await supabase.from("profiles").select("*").eq("role", "owner");
    // Customers count
    const { count: custCount } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer");
    // Monthly revenue
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const { data: payments } = await supabase.from("payments").select("amount").gte("created_at", startOfMonth.toISOString());
    const revenue = (payments || []).reduce((s, p) => s + (p.amount || 0), 0);
    // Open issues from activity logs
    const { count: issueCount } = await supabase.from("activity_logs").select("id", { count: "exact", head: true }).eq("type", "alert");
    // Recent activity
    const { data: logs } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(5);

    const ownerList = owners || [];
    const activeCount    = ownerList.filter(o => o.status !== "suspended").length;
    const suspendedCount = ownerList.filter(o => o.status === "suspended").length;
    const overdueOwners  = ownerList.filter(o => o.fee_status === "overdue").length;
    const pendingFees    = ownerList.filter(o => o.fee_status === "overdue").reduce((s, o) => s + (o.fee || 0), 0);

    // Enrich cashier rows
    const enriched = await Promise.all(ownerList.slice(0, 10).map(async (o) => {
      const { count: cc } = await supabase.from("customers").select("id", { count: "exact", head: true }).eq("owner_id", o.id);
      const { data: oc }  = await supabase.from("customers").select("id").eq("owner_id", o.id);
      const ids = (oc || []).map(c => c.id);
      let openTabs = 0, owed = 0;
      if (ids.length > 0) {
        const { count: tc } = await supabase.from("orders").select("id", { count: "exact", head: true }).in("customer_id", ids);
        const { data: custRows } = await supabase.from("customers").select("balance").in("id", ids);
        openTabs = tc || 0;
        owed = (custRows || []).reduce((s, c) => s + (c.balance || 0), 0);
      }
      return {
        id: o.id,
        name: o.business_name || "Unnamed",
        status: o.status || "active",
        customers: cc || 0,
        openTabs,
        owed,
        joined: o.created_at ? new Date(o.created_at).toLocaleDateString("en-ZA") : "—",
        lastActivity: o.updated_at || o.created_at,
      };
    }));

    setStats({ total: ownerList.length + (custCount || 0), active: activeCount, suspended: suspendedCount, customers: custCount || 0, cashiers: ownerList.length, revenue, pendingFees, openIssues: issueCount || 0 });
    setCashiers(enriched);
    setActivity(logs || []);
    setOverdueCount(overdueOwners);
    setLoading(false);
  }

  const filtered = cashiers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{dashStyles}</style>

      <div className="dash-stat-grid">
        {[
          { label: "Total Accounts",   value: loading ? "…" : stats.total,              cls: "",      icon: "users",    iconBg: "rgba(59,130,246,0.12)", iconColor: "#3b82f6",      delta: `${stats.cashiers} cashiers · ${stats.customers} customers` },
          { label: "Active Accounts",  value: loading ? "…" : stats.active,             cls: "green", icon: "check",    iconBg: "rgba(29,184,122,0.12)", iconColor: "var(--green)", delta: `${stats.suspended} suspended` },
          { label: "Open Issues",      value: loading ? "…" : stats.openIssues,         cls: "red",   icon: "alert",    iconBg: "rgba(229,53,53,0.12)",  iconColor: "#e53535",      delta: "Disputes & alerts" },
          { label: "Monthly Revenue",  value: loading ? "…" : `R${stats.revenue.toLocaleString()}`, cls: "green", icon: "payments", iconBg: "rgba(29,184,122,0.12)", iconColor: "var(--green)", delta: `R${stats.pendingFees.toLocaleString()} pending fees`, deltaCls: "red" },
        ].map((s, i) => (
          <div key={i} className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: s.iconBg, color: s.iconColor }}><Icon name={s.icon} size={17} /></div>
            <div className="dash-stat-label">{s.label}</div>
            <div className={`dash-stat-value ${s.cls}`}>{s.value}</div>
            <div className={`dash-stat-delta ${s.deltaCls || ""}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="dash-body">
        <div className="dash-left">
          <div className="card" style={{ padding: 0 }}>
            <div className="dash-table-toolbar">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="card-title">Cashiers</span>
                <span className="info-chip" style={{ fontSize: 11, padding: "2px 8px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, color: "var(--text-light)", fontWeight: 600 }}>
                  {cashiers.length} total
                </span>
              </div>
              <div className="dash-toolbar-right">
                <div className="dash-search">
                  <Icon name="search" size={13} />
                  <input placeholder="Search cashiers..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-light)" }}>view accounts page for more info &gt;&gt;&gt;</span>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Status</th>
                    <th>Customers</th>
                    <th>Open Tabs</th>
                    <th>Outstanding</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-light)" }}>Loading…</td></tr>
                  ) : filtered.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="dash-client-name">{c.name}</div>
                        <div className="dash-client-sub">Joined {c.joined}</div>
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ fontWeight: 500 }}>{c.customers}</td>
                      <td style={{ fontWeight: 500 }}>{c.openTabs}</td>
                      <td>
                        <span className={`dash-outstanding ${c.owed === 0 ? "zero" : ""}`}>
                          R{c.owed.toFixed(2)}
                        </span>
                      </td>
                      <td className="dash-last-activity">{c.lastActivity ? formatTime(c.lastActivity) : "—"}</td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px 18px", color: "var(--text-light)" }}>No cashiers match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="dash-table-footer">
              <span>Showing {filtered.length} of {cashiers.length} cashiers</span>
            </div>
          </div>
        </div>

        <div className="dash-right">
          {/* Activity feed */}
          <div className="dash-side-card">
            <div className="dash-side-header">
              <span className="dash-side-title">Today's Activity</span>
              <button className="dash-view-all" onClick={() => navigate('/admin/activity')}>View all</button>
            </div>
            {activity.length === 0 && !loading ? (
              <div style={{ padding: "20px 16px", fontSize: 12, color: "var(--text-light)", textAlign: "center" }}>No activity yet.</div>
            ) : activity.map((a, i) => {
              const colors = iconColors[a.type] || iconColors.success;
              return (
                <div key={i} className="dash-activity-item">
                  <div className="dash-activity-icon" style={{ background: colors.bg, color: colors.color }}>
                    <Icon name={a.type === "payment" ? "cashier" : a.type === "money" ? "payments" : a.type} size={14} />
                  </div>
                  <div className="dash-activity-body">
                    <div className="dash-activity-msg">{a.title}</div>
                    <div className="dash-activity-sub">{a.subtitle}</div>
                  </div>
                  <div className="dash-activity-time">{formatTime(a.created_at)}</div>
                </div>
              );
            })}
          </div>

          {/* Outstanding fees */}
          <div className="dash-side-card">
            <div className="dash-side-header">
              <span className="dash-side-title">Outstanding Fees</span>
              <button className="dash-view-all" onClick={() => navigate('/admin/payments')}>View all</button>
            </div>
            <div className="dash-fees-body">
              <div className="dash-fees-amount">R{stats.pendingFees.toLocaleString()}</div>
              <div className="dash-fees-sub">From {overdueCount} cashiers</div>
              <svg className="dash-sparkline" viewBox="0 0 200 36" preserveAspectRatio="none">
                <polyline fill="none" stroke="#e53535" strokeWidth="1.5" strokeLinejoin="round" points="0,28 20,22 40,26 60,16 80,20 100,10 120,14 140,8 160,18 180,12 200,6" />
                <polyline fill="rgba(229,53,53,0.08)" stroke="none" points="0,28 20,22 40,26 60,16 80,20 100,10 120,14 140,8 160,18 180,12 200,6 200,36 0,36" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

