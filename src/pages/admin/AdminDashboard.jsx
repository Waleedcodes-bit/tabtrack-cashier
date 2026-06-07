import { useState, useEffect } from "react";
import DashboardPage from "./DashboardPage";
import AccountsPage  from "./AccountsPage";
import PaymentsPage  from "./PaymentsPage";
import FeedbackPage  from "./FeedbackPage";
import SettingsPage  from "./AdminSettings";
import { Icon, StatusBadge } from "./Shared.jsx";
import { supabase } from '../../lib/supabase';
import NavoqLogo from '../../assets/NavoqLogo.png';
import CustomersPage from "./CustomersPage";
import ReportsPage from "./ReportsPage";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green: #1db87a;
    --green-dim: #16935f;
    --green-light: rgba(29,184,122,0.1);
    --green-glow: rgba(29,184,122,0.18);
    --font-serif: 'Cormorant Garamond', Georgia, serif;
    --font-sans: 'DM Sans', sans-serif;
    --radius: 12px;
    --radius-lg: 16px;
    --sidebar-w: 240px;
  }

  .admin-light {
    --bg: #f7f8f6; --bg2: #ffffff; --bg3: #eef1ec;
    --card: #ffffff; --border: rgba(0,0,0,0.08); --border2: rgba(0,0,0,0.05);
    --text: #1a2b1f; --text-mid: #4d6b55; --text-light: #8fa98f;
    --shadow: 0 2px 16px rgba(0,0,0,0.06);
    --sidebar-bg: #ffffff; --sidebar-text: #4d6b55;
    --sidebar-active-bg: rgba(29,184,122,0.1); --sidebar-active-text: #0f6b3c;
    --topbar-bg: rgba(247,248,246,0.92);
  }

  .admin-dark {
    --bg: #080f0b; --bg2: #0d1a12; --bg3: #0a1510;
    --card: #0f1f16; --border: rgba(29,184,122,0.12); --border2: rgba(255,255,255,0.06);
    --text: #eef2ee; --text-mid: #8fa98f; --text-light: #4d6b55;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --sidebar-bg: #0a1510; --sidebar-text: #8fa98f;
    --sidebar-active-bg: rgba(29,184,122,0.12); --sidebar-active-text: #1db87a;
    --topbar-bg: rgba(8,15,11,0.92);
  }

  .admin-root {
    font-family: var(--font-sans); background: var(--bg); color: var(--text);
    min-height: 100vh; display: flex; font-size: 14px; line-height: 1.6;
    transition: background 0.3s, color 0.3s;
  }

  /* SIDEBAR */
  .sidebar {
    width: var(--sidebar-w); background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
    transition: background 0.3s, border-color 0.3s;
  }
  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 16px; border-bottom: 1px solid var(--border2);
  }
  .logo-icon {
    width: 34px; height: 34px; background: var(--green); color: #040d07;
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    font-family: var(--font-sans); font-size: 11px; font-weight: 700; flex-shrink: 0;
  }
  .logo-text { font-family: var(--font-serif); font-size: 18px; font-weight: 600; color: var(--text); }
  .logo-sub  { font-size: 10px; color: var(--text-light); letter-spacing: 0.08em; font-weight: 600; margin-top: -2px; }
  .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
  .nav-section-label { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; color: var(--text-light); padding: 10px 8px 6px; margin-top: 8px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    border-radius: 10px; cursor: pointer; color: var(--sidebar-text);
    font-size: 13.5px; font-weight: 500; transition: background 0.15s, color 0.15s;
    border: none; background: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: var(--bg3); color: var(--text); }
  .nav-item.active { background: var(--sidebar-active-bg); color: var(--sidebar-active-text); }
  .nav-item svg { flex-shrink: 0; opacity: 0.75; }
  .nav-item.active svg { opacity: 1; }
  .nav-badge { margin-left: auto; background: #e53535; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 20px; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border2); }

  /* MAIN */
  .main-content { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

  /* TOPBAR */
  .topbar {
    position: sticky; top: 0; background: var(--topbar-bg);
    backdrop-filter: blur(16px); border-bottom: 1px solid var(--border2);
    z-index: 40; display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; height: 60px; gap: 16px;
  }
  .topbar-title { font-family: var(--font-serif); font-size: 22px; font-weight: 600; color: var(--text); }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .icon-btn {
    width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--card); color: var(--text-mid); display: flex; align-items: center;
    justify-content: center; cursor: pointer; transition: all 0.15s;
  }
  .icon-btn:hover { border-color: var(--green); color: var(--green); }
  .admin-avatar {
    width: 34px; height: 34px; border-radius: 50%; background: var(--green);
    color: #040d07; display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; cursor: pointer;
  }

  /* PAGE */
  .page { padding: 28px; flex: 1; }

  /* STAT CARDS */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; box-shadow: var(--shadow); transition: border-color 0.2s, transform 0.2s; }
  .stat-card:hover { border-color: rgba(29,184,122,0.3); transform: translateY(-2px); }
  .stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: var(--text-light); margin-bottom: 8px; }
  .stat-value { 
  font-family: var(--font-sans); 
  font-size: 28px; 
  font-weight: 700; 
  color: var(--text); 
  line-height: 1; 
}
  .stat-value.green { color: var(--green); }
  .stat-value.red   { color: #e53535; }
  .stat-sub  { font-size: 12px; color: var(--text-light); margin-top: 4px; }
  .stat-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }

  /* CARD */
  .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow); overflow: hidden; }
  .card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border2); }
  .card-title { font-size: 15px; font-weight: 600; color: var(--text); }
  .card-sub   { font-size: 12px; color: var(--text-light); margin-top: 2px; }

  /* TABLE */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th { text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.09em; color: var(--text-light); padding: 10px 16px; border-bottom: 1px solid var(--border2); white-space: nowrap; }
  td { padding: 12px 16px; border-bottom: 1px solid var(--border2); color: var(--text); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--bg3); }

  /* BADGES */
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; white-space: nowrap; }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .badge-green  { background: rgba(29,184,122,0.12); color: #0f6b3c; }
  .badge-green .badge-dot { background: var(--green); }
  .badge-red    { background: rgba(229,53,53,0.1);   color: #c02020; }
  .badge-red .badge-dot { background: #e53535; }
  .badge-yellow { background: rgba(234,179,8,0.12);  color: #92640a; }
  .badge-yellow .badge-dot { background: #eab308; }
  .badge-blue   { background: rgba(59,130,246,0.1);  color: #1d4ed8; }
  .badge-blue .badge-dot { background: #3b82f6; }
  .badge-gray   { background: rgba(107,114,128,0.1); color: #374151; }
  .admin-dark .badge-green  { color: #1db87a; }
  .admin-dark .badge-red    { color: #f87171; }
  .admin-dark .badge-yellow { color: #fbbf24; }
  .admin-dark .badge-blue   { color: #60a5fa; }
  .admin-dark .badge-gray   { color: #9ca3af; }

  /* BUTTONS */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 50px; font-size: 13px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all 0.15s; border: none; white-space: nowrap; }
  .btn-primary { background: var(--green); color: #040d07; }
  .btn-primary:hover { background: #22d98e; transform: translateY(-1px); }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-mid); }
  .btn-outline:hover { border-color: var(--green); color: var(--green); }
  .btn-ghost  { background: transparent; color: var(--text-mid); padding: 6px 10px; }
  .btn-ghost:hover { color: var(--text); background: var(--bg3); border-radius: 8px; }
  .btn-danger { background: rgba(229,53,53,0.1); color: #c02020; border: 1px solid rgba(229,53,53,0.2); }
  .btn-danger:hover { background: rgba(229,53,53,0.2); }
  .admin-dark .btn-danger { color: #f87171; }
  .btn-sm { padding: 5px 12px; font-size: 12px; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* INPUTS */
  .input { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 14px; font-size: 13.5px; font-family: var(--font-sans); width: 100%; outline: none; transition: border-color 0.15s; }
  .input:focus { border-color: var(--green); }
  .input::placeholder { color: var(--text-light); }
  .select { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 14px; font-size: 13.5px; font-family: var(--font-sans); outline: none; cursor: pointer; transition: border-color 0.15s; }
  .select:focus { border-color: var(--green); }

  /* FORM */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; font-weight: 600; color: var(--text-mid); margin-bottom: 6px; letter-spacing: 0.05em; }

  /* GRID */
  .two-col   { display: grid; grid-template-columns: 1fr 1fr;     gap: 20px; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

  /* GAPS */
  .section-gap    { margin-bottom: 24px; }
  .section-gap-sm { margin-bottom: 16px; }

  /* PROGRESS */
  .progress-bar  { height: 6px; background: var(--bg3); border-radius: 4px; overflow: hidden; margin-top: 8px; }
  .progress-fill { height: 100%; background: var(--green); border-radius: 4px; transition: width 0.6s ease; }
  .progress-fill.red    { background: #e53535; }
  .progress-fill.yellow { background: #eab308; }

  /* FEEDBACK THREAD */
  .thread-msg { padding: 14px 16px; border-radius: 10px; font-size: 13.5px; line-height: 1.6; margin-bottom: 10px; }
  .thread-msg.from-user  { background: var(--bg3); color: var(--text); }
  .thread-msg.from-admin { background: rgba(29,184,122,0.1); color: var(--text); border-left: 3px solid var(--green); }
  .thread-meta { font-size: 11px; color: var(--text-light); margin-bottom: 4px; }

  /* OVERVIEW BARS */
  .overview-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border2); }
  .overview-row:last-child { border-bottom: none; }
  .overview-label { font-size: 13px; color: var(--text-mid); min-width: 130px; }
  .overview-bar { flex: 1; height: 8px; background: var(--bg3); border-radius: 4px; overflow: hidden; }
  .overview-bar-fill { height: 100%; border-radius: 4px; }
  .overview-val { font-size: 13px; font-weight: 600; color: var(--text); min-width: 40px; text-align: right; }

  /* PILL TABS */
  .pill-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
  .pill-tab { padding: 7px 16px; border-radius: 50px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); color: var(--text-mid); background: transparent; transition: all 0.15s; font-family: var(--font-sans); }
  .pill-tab.active, .pill-tab:hover { background: var(--green); color: #040d07; border-color: var(--green); }

  /* EMPTY STATE */
  .empty-state { text-align: center; padding: 48px 24px; color: var(--text-light); }
  .empty-state svg { margin: 0 auto 12px; opacity: 0.3; }
  .empty-state p { font-size: 14px; }

  /* INFO CHIP */
  .info-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-light); background: var(--bg3); padding: 3px 10px; border-radius: 20px; }

  /* TOGGLE */
  .toggle { position: relative; width: 40px; height: 22px; background: var(--bg3); border-radius: 11px; cursor: pointer; border: 1px solid var(--border); transition: background 0.2s; flex-shrink: 0; }
  .toggle.on { background: var(--green); border-color: var(--green); }
  .toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
  .toggle.on::after { transform: translateX(18px); }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 480px; box-shadow: 0 24px 64px rgba(0,0,0,0.3); }
  .modal-title { font-family: var(--font-serif); font-size: 22px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .modal-sub { font-size: 13px; color: var(--text-light); margin-bottom: 22px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }

  /* SEARCH BAR */
  .search-bar { position: relative; flex: 1; max-width: 320px; }
  .search-bar svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-light); pointer-events: none; }
  .search-bar .input { padding-left: 36px; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-light); }

  @media (max-width: 900px) {
    .two-col { grid-template-columns: 1fr; }
    .three-col { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .sidebar { transform: translateX(-100%); }
    .main-content { margin-left: 0; }
    .three-col { grid-template-columns: 1fr; }
  }
`;

// ─── ROOT SHELL ───────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(false);
  const [feedbackBadge, setFeedbackBadge] = useState(0);

  // Fetch initial feedback open count for sidebar badge
  useEffect(() => {
    supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .then(({ count }) => setFeedbackBadge(count || 0));
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // TODO: redirect to login page once auth is wired up
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "accounts",  label: "Accounts",  icon: "users" },
    { id: "payments",  label: "Payments",  icon: "payments" },
    { id: "customers", label: "Customers", icon: "users" },
    { id: "reports",   label: "Reports",   icon: "chart"  },
    { id: "feedback",  label: "Feedback",  icon: "feedback", badge: feedbackBadge },
    { id: "settings",  label: "Settings",  icon: "settings" },
  ];

  const titles = {
    dashboard: "Dashboard",
    accounts:  "Accounts",
    payments:  "Payment Allocations",
    feedback:  "Feedback & Issues",
    customers: "Customers",
    reports:   "Reports",
    settings:  "Settings",
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`admin-root ${dark ? "admin-dark" : "admin-light"}`}>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <img src={NavoqLogo} alt="Navoq Logo" className="logo-icon" />
            <div>
              <div className="logo-text">Navoq</div>
              <div className="logo-sub">ADMIN PANEL</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">MAIN</div>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => setPage(item.id)}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
                {item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item" onClick={() => setDark((d) => !d)}>
              <Icon name={dark ? "sun" : "moon"} size={16} />
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
            <button className="nav-item" style={{ color: "#e53535" }} onClick={handleSignOut}>
              <Icon name="logout" size={16} />
              Sign Out
            </button>
            <div style={{
              fontSize: 10, color: "var(--text-light)",
              textAlign: "center", marginTop: 12, letterSpacing: "0.06em"
            }}>
              A PRODUCT OF NIDAAM LABS
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-content">
          <header className="topbar">
            <h1 className="topbar-title">{titles[page]}</h1>
            <div className="topbar-right">
              <div className="admin-avatar">A</div>
            </div>
          </header>

          <div className="page">
            {page === "dashboard" && <DashboardPage />}
            {page === "accounts"  && <AccountsPage />}
            {page === "payments"  && <PaymentsPage />}
            {page === "feedback"  && <FeedbackPage onBadgeUpdate={setFeedbackBadge} />}
            {page === "settings"  && <SettingsPage dark={dark} setDark={setDark} />}
            {page === "customers" && <CustomersPage />}
            {page === "reports"   && <ReportsPage />}
          </div>
        </main>

      </div>
    </>
  );
}