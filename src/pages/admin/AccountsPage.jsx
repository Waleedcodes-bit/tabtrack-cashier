import { useState, useEffect } from "react";
import { Icon, StatusBadge } from "./Shared";
import { supabase } from '../../lib/supabase';

function EditFeeModal({ cashier, onClose, onSave }) {
  const [fee, setFee] = useState(cashier.fee);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Set Monthly Fee</div>
        <div className="modal-sub">Adjust the recurring monthly fee for {cashier.name}</div>
        <div className="form-group">
          <label className="form-label">MONTHLY FEE (R)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-mid)" }}>R</span>
            <input
              type="number"
              className="input"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              min={0}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {[0, 99, 199, 399].map((v) => (
            <button
              key={v}
              className={`btn btn-sm ${fee === v ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFee(v)}
            >
              {v === 0 ? "Free" : `R${v}`}
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(fee)}>Save Fee</button>
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);

    // All queries fired in parallel — no per-owner loops
    const [
      { data: owners, error: ownersError },
      { count: custCount },
      { data: allCustomers },
      { data: allOrders },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "owner"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("customers").select("id, owner_id, balance"),
      supabase.from("orders").select("id, customer_id, amount"),
    ]);

    if (ownersError) {
      console.error("Error fetching owners:", ownersError);
      setLoading(false);
      return;
    }

    setCustomerCount(custCount || 0);

    // Build lookup maps from bulk data — zero extra queries
    const customersByOwner = {};
    (allCustomers || []).forEach(c => {
      if (!c.owner_id) return;
      if (!customersByOwner[c.owner_id]) customersByOwner[c.owner_id] = [];
      customersByOwner[c.owner_id].push(c.id);
    });

    const custIdToOwner = {};
    (allCustomers || []).forEach(c => { if (c.owner_id) custIdToOwner[c.id] = c.owner_id; });

    const tabsByOwner = {};
    const revenueByOwner = {};
    (allOrders || []).forEach(o => {
      const ownerId = custIdToOwner[o.customer_id];
      if (!ownerId) return;
      tabsByOwner[ownerId] = (tabsByOwner[ownerId] || 0) + 1;
      revenueByOwner[ownerId] = (revenueByOwner[ownerId] || 0) + (o.amount || 0);
    });

    const enriched = (owners || []).map(owner => ({
      id: owner.id,
      name: owner.business_name || owner.owner_name || "Unnamed Business",
      owner: owner.owner_name || "Unknown",
      email: owner.email || "",
      type: owner.business_type || "shop",
      customers: (customersByOwner[owner.id] || []).length,
      openTabs: tabsByOwner[owner.id] || 0,
      revenue: revenueByOwner[owner.id] || 0,
      status: owner.status || "active",
      fee: owner.fee || 0,
      feeStatus: owner.fee_status || "paid",
    }));

    setAccounts(enriched);
    setLoading(false);
  }

  const filtered = accounts.filter((a) => {
    const matchTab =
      tab === "all" ||
      tab === a.type ||
      (tab === "suspended" && a.status === "suspended") ||
      (tab === "overdue" && a.feeStatus === "overdue");
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.owner.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleStatus = async (id) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;

    const newStatus = account.status === "active" ? "suspended" : "active";

    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      return;
    }

    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div>
      {/* ── Summary stats ── */}
      <div className="stat-grid section-gap">
        {[
          { label: "TOTAL CASHIERS", value: accounts.length,                                         icon: "cashier", color: "#1db87a", bg: "rgba(29,184,122,0.1)"  },
          { label: "RESTAURANTS",    value: accounts.filter((c) => c.type === "restaurant").length,  icon: "store",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
          { label: "SHOPS",          value: accounts.filter((c) => c.type === "shop").length,        icon: "cashier", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
          { label: "CUSTOMERS",      value: customerCount,                                            icon: "users",   color: "#eab308", bg: "rgba(234,179,8,0.1)"   },
          { label: "SUSPENDED",      value: accounts.filter((a) => a.status === "suspended").length, icon: "shield",  color: "#e53535", bg: "rgba(229,53,53,0.1)",  cls: "red" },
          { label: "OVERDUE FEES",   value: accounts.filter((a) => a.feeStatus === "overdue").length, icon: "alert",  color: "#e53535", bg: "rgba(229,53,53,0.1)",  cls: "red" },
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

      {/* ── Cashier accounts table ── */}
      <div className="card section-gap">
        <div className="card-header">
          <div>
            <div className="card-title">Cashier Accounts</div>
            <div className="card-sub">Restaurants &amp; shops on the platform</div>
          </div>
          <div className="search-bar">
            <Icon name="search" size={14} />
            <input
              className="input"
              placeholder="Search by name or owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        <div style={{ padding: "12px 20px 12px", display: "flex", gap: 6, borderBottom: "1px solid var(--border2)" }}>
          {["all", "restaurant", "shop", "suspended", "overdue"].map((t) => (
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
              <p>Loading accounts…</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Owner</th>
                  <th>Type</th>
                  <th>Customers</th>
                  <th>Open Tabs</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th>Monthly Fee</th>
                  <th>Fee Status</th>
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
                    <td style={{ color: "var(--text-mid)" }}>{c.owner}</td>
                    <td><StatusBadge status={c.type} /></td>
                    <td style={{ fontWeight: 600 }}>{c.customers}</td>
                    <td>{c.openTabs}</td>
                    <td style={{ fontWeight: 600, color: "var(--green)" }}>R{c.revenue.toLocaleString()}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <span style={{ fontWeight: 600 }}>R{c.fee}</span>
                      <span style={{ fontSize: 11, color: "var(--text-light)" }}>/mo</span>
                    </td>
                    <td><StatusBadge status={c.feeStatus} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => { setSelected(c); setShowModal(true); }}
                        >
                          Edit fee
                        </button>
                        <button
                          className={`btn btn-sm ${c.status === "active" ? "btn-danger" : "btn-outline"}`}
                          onClick={() => toggleStatus(c.id)}
                        >
                          {c.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10}>
                      <div className="empty-state">
                        <Icon name="search" size={28} />
                        <p>No cashiers match your search or filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Edit fee modal ── */}
      {showModal && selected && (
        <EditFeeModal
          cashier={selected}
          onClose={() => setShowModal(false)}
          onSave={async (newFee) => {
            const { error } = await supabase
              .from("profiles")
              .update({ fee: newFee })
              .eq("id", selected.id);

            if (error) {
              console.error("Error updating fee:", error);
              return;
            }

            setAccounts((prev) =>
              prev.map((a) => (a.id === selected.id ? { ...a, fee: newFee } : a))
            );
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}