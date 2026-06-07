import { useState, useEffect } from "react";
import { Icon } from "./Shared.jsx";
import { supabase } from "../../lib/supabase";

export default function AdminSettings({ dark, setDark }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "Nidaam Labs (Pty) Ltd",
  });

  const [notifications, setNotifications] = useState({
    newAccount:     true,
    overduePayment: true,
    newFeedback:    true,
    weeklyReport:   false,
  });

  const [saved,     setSaved]     = useState(false);
  const [pwSaved,   setPwSaved]   = useState(false);
  const [pwError,   setPwError]   = useState("");
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [loading,   setLoading]   = useState(false);

  // Load current user info on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setForm(f => ({
        ...f,
        email: user.email || "",
        name:  user.user_metadata?.full_name || "Navoq Admin",
        phone: user.user_metadata?.phone || "",
      }));
    });
  }, []);

  const saveProfile = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      email: form.email,
      data: { full_name: form.name, phone: form.phone },
    });
    setLoading(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    }
  };

  const savePassword = async () => {
    setPwError("");
    if (!passwords.next || passwords.next !== passwords.confirm) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.next });
    setLoading(false);
    if (error) {
      setPwError(error.message);
      return;
    }
    setPwSaved(true);
    setPasswords({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2200);
  };

  return (
    <div style={{ maxWidth: 760 }}>

      {/* ── Profile & Account ── */}
      <div className="card section-gap">
        <div className="card-header">
          <div>
            <div className="card-title">Profile &amp; Account</div>
            <div className="card-sub">Update your admin account information</div>
          </div>
        </div>
        <div style={{ padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--green)", color: "#040d07", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
              {form.name ? form.name[0].toUpperCase() : "A"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{form.name || "Navoq Admin"}</div>
              <div style={{ fontSize: 12, color: "var(--text-light)" }}>Super Administrator · Nidaam Labs</div>
            </div>
          </div>

          <div className="two-col">
            {[
              { label: "FULL NAME",     key: "name",    type: "text"  },
              { label: "EMAIL ADDRESS", key: "email",   type: "email" },
              { label: "PHONE NUMBER",  key: "phone",   type: "tel"   },
              { label: "COMPANY",       key: "company", type: "text"  },
            ].map((f) => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input
                  type={f.type}
                  className="input"
                  value={form[f.key]}
                  onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={saveProfile} disabled={loading}>
            {saved ? <><Icon name="check" size={13} />Saved!</> : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Password & Security ── */}
      <div className="card section-gap">
        <div className="card-header">
          <div>
            <div className="card-title">Password &amp; Security</div>
            <div className="card-sub">Update your login credentials</div>
          </div>
          <span className="info-chip"><Icon name="shield" size={12} />2FA not enabled</span>
        </div>
        <div style={{ padding: "22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "CURRENT PASSWORD", key: "current" },
              { label: "NEW PASSWORD",     key: "next"    },
              { label: "CONFIRM PASSWORD", key: "confirm" },
            ].map((f) => (
              <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{f.label}</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={passwords[f.key]}
                  onChange={(e) => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {passwords.next && passwords.confirm && passwords.next !== passwords.confirm && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#e53535", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="alert" size={13} />Passwords do not match
            </div>
          )}
          {pwError && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#e53535" }}>{pwError}</div>
          )}

          <button
            className="btn btn-outline"
            style={{ marginTop: 16 }}
            onClick={savePassword}
            disabled={!passwords.current || !passwords.next || passwords.next !== passwords.confirm || loading}
          >
            {pwSaved ? <><Icon name="check" size={13} />Password updated!</> : "Update Password"}
          </button>
        </div>
      </div>

      {/* ── Appearance ── */}
      <div className="card section-gap">
        <div className="card-header">
          <div>
            <div className="card-title">Appearance</div>
            <div className="card-sub">Customize how the admin panel looks</div>
          </div>
        </div>
        <div style={{ padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: "var(--text-light)" }}>Switch between light and dark theme</div>
            </div>
            <div className={`toggle ${dark ? "on" : ""}`} onClick={() => setDark(d => !d)} />
          </div>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className="card section-gap">
        <div className="card-header">
          <div>
            <div className="card-title">Notifications</div>
            <div className="card-sub">Choose what alerts you receive</div>
          </div>
        </div>
        <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { key: "newAccount",     label: "New account registered",  desc: "Alert when a cashier or customer signs up"         },
            { key: "overduePayment", label: "Overdue payment",         desc: "Alert when a cashier misses a monthly payment"     },
            { key: "newFeedback",    label: "New feedback / issue",    desc: "Alert when feedback is submitted"                  },
            { key: "weeklyReport",   label: "Weekly summary report",   desc: "Email digest every Monday"                        },
          ].map((n) => (
            <div key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{n.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-light)" }}>{n.desc}</div>
              </div>
              <div className={`toggle ${notifications[n.key] ? "on" : ""}`} onClick={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key] }))} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Default fee tiers ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Default Fee Tiers</div>
            <div className="card-sub">Used as starting point for new cashiers</div>
          </div>
        </div>
        <div style={{ padding: "22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "STARTER (FREE)", value: "R0",     desc: "Up to 10 customers" },
              { label: "PRO",            value: "R199",   desc: "Unlimited customers" },
              { label: "ENTERPRISE",     value: "Custom", desc: "Multi-branch"        },
            ].map((t) => (
              <div key={t.label} style={{ background: "var(--bg3)", borderRadius: 10, padding: "16px", border: "1px solid var(--border2)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-light)", marginBottom: 6 }}>{t.label}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700, color: "var(--green)" }}>{t.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}