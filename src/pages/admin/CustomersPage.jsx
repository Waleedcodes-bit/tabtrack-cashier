import { useState, useEffect } from "react";
import { Icon, StatusBadge } from "./Shared";
import { supabase } from "../../lib/supabase";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);

    // Fetch all customer profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer");

    if (error) { console.error(error); setLoading(false); return; }

    // For each customer, get their balance and linked owner name
    const enriched = await Promise.all((profiles || []).map(async (p) => {
      // Get their balance from customers table
      const { data: customerRow } = await supabase
        .from("customers")
        .select("balance, joined_date")
        .eq("id", p.id)
        .single();

      // Get orders count (open tabs)
      const { count: tabCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", p.id);

      // Get linked owner business name
      let linkedTo = [];
      if (p.owner_id) {
        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("business_name")
          .eq("id", p.owner_id)
          .single();
        if (ownerProfile?.business_name) linkedTo = [ownerProfile.business_name];
      }

      return {
        id: p.id,
        name: p.owner_name || "Unknown",
        email: p.email || "",
        status: p.status || "active",
        tabs: tabCount || 0,
        totalOwed: customerRow?.balance || 0,
        linkedTo,
        joined: customerRow?.joined_date
          ? new Date(customerRow.joined_date).toLocaleDateString("en-ZA")
          : "—",
      };
    }));

    setCustomers(enriched);
    setLoading(false);
  }

  const filtered = customers.filter((c) => {
    const matchTab =
      tab === "all" ||
      (tab === "active"    && c.status === "active") ||
      (tab === "suspended" && c.status === "suspended") ||
      (tab === "owing"     && c.totalOwed > 0);
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalOutstanding = customers.reduce((s, c) => s + c.totalOwed, 0);

  return (
    <div>
      {/* ── Stats ── */}
      <div className="stat-grid section-gap">
        {[
          { label: "TOTAL CUSTOMERS",   value: customers.length,                                          icon: "users",    color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
          { label: "ACTIVE",            value: customers.filter(c => c.status === "active").length,       icon: "check",    color: "#1db87a", bg: "rgba(29,184,122,0.1)", cls: "green" },
          { label: "SUSPENDED",         value: customers.filter(c => c.status === "suspended").length,    icon: "shield",   color: "#e53535", bg: "rgba(229,53,53,0.1)",  cls: "red"   },
          { label: "TOTAL OUTSTANDING", value: `R${totalOutstanding.toLocaleString()}`,                   icon: "payments", color: "#1db87a", bg: "rgba(29,184,122,0.1)", cls: "green" },
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

      {/* ── Table ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Customers</div>
            <div className="card-sub">Every customer registered across all cashiers</div>
          </div>
          <div className="search-bar">
            <Icon name="search" size={14} />
            <input
              className="input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        <div style={{ padding: "12px 20px", display: "flex", gap: 6, borderBottom: "1px solid var(--border2)" }}>
          {["all", "active", "suspended", "owing"].map((t) => (
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
            <div className="empty-state"><p>Loading customers…</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Open Tabs</th>
                  <th>Total Owed</th>
                  <th>Linked To</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-light)" }}>{c.email}</div>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontWeight: 600 }}>{c.tabs}</td>
                    <td style={{ fontWeight: 600, color: c.totalOwed > 0 ? "#e53535" : "var(--text-light)" }}>
                      R{c.totalOwed.toFixed(2)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {c.linkedTo.length > 0
                          ? c.linkedTo.map((b, i) => <span key={i} className="info-chip" style={{ fontSize: 11 }}>{b}</span>)
                          : <span style={{ color: "var(--text-light)", fontSize: 12 }}>—</span>}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-light)", fontSize: 12 }}>{c.joined}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelected(selected?.id === c.id ? null : c)}
                      >
                        {selected?.id === c.id ? "Close" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <Icon name="search" size={28} />
                        <p>No customers match your search or filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Customer Detail Panel ── */}
      {selected && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-title">{selected.name}</div>
              <div className="card-sub">{selected.email}</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Close</button>
          </div>
          <div style={{ padding: 22 }}>
            <div className="three-col">
              {[
                { label: "STATUS",            value: <StatusBadge status={selected.status} /> },
                { label: "OPEN TABS",         value: selected.tabs },
                { label: "TOTAL OWED",        value: `R${selected.totalOwed.toFixed(2)}` },
                { label: "JOINED",            value: selected.joined },
                { label: "LINKED CASHIERS",   value: selected.linkedTo.join(", ") || "None" },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-light)", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}