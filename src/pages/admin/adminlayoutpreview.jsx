import { useState, createContext, useContext } from "react";

const layoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --green: #1db87a; --green-dim: #16935f; --green-light: rgba(29,184,122,0.1);
    --font-serif: 'Cormorant Garamond', Georgia, serif;
    --font-sans: 'DM Sans', sans-serif;
    --radius: 12px; --radius-lg: 16px; --sidebar-w: 240px;
  }
  .admin-light {
    --bg: #f7f8f6; --bg2: #ffffff; --bg3: #eef1ec; --card: #ffffff;
    --border: rgba(0,0,0,0.08); --border2: rgba(0,0,0,0.05);
    --text: #1a2b1f; --text-mid: #4d6b55; --text-light: #8fa98f;
    --shadow: 0 2px 16px rgba(0,0,0,0.06);
    --sidebar-bg: #ffffff; --sidebar-text: #4d6b55;
    --sidebar-active-bg: rgba(29,184,122,0.1); --sidebar-active-text: #0f6b3c;
    --topbar-bg: rgba(247,248,246,0.92);
  }
  .admin-dark {
    --bg: #080f0b; --bg2: #0d1a12; --bg3: #0a1510; --card: #0f1f16;
    --border: rgba(29,184,122,0.12); --border2: rgba(255,255,255,0.06);
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
  .sidebar {
    width: var(--sidebar-w); background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
    transition: background 0.3s, border-color 0.3s, transform 0.3s;
  }
  .sidebar-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 49;
  }
  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 16px; border-bottom: 1px solid var(--border2); flex-shrink: 0;
  }
  .logo-icon {
    width: 34px; height: 34px; background: var(--green); color: #040d07;
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    font-family: var(--font-sans); font-size: 11px; font-weight: 700; flex-shrink: 0;
  }
  .logo-text { font-family: var(--font-serif); font-size: 18px; font-weight: 600; color: var(--text); }
  .logo-sub { font-size: 10px; color: var(--text-light); letter-spacing: 0.08em; font-weight: 600; margin-top: -2px; }
  .sidebar-nav {
    flex: 1; padding: 16px 12px; display: flex; flex-direction: column;
    gap: 2px; overflow-y: auto;
  }
  .nav-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
    color: var(--text-light); padding: 10px 8px 6px; margin-top: 8px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    border-radius: 10px; cursor: pointer; color: var(--sidebar-text);
    font-size: 13.5px; font-weight: 500;
    transition: background 0.15s, color 0.15s;
    border: none; background: none; width: 100%; text-align: left;
    font-family: var(--font-sans);
  }
  .nav-item:hover { background: var(--bg3); color: var(--text); }
  .nav-item.active { background: var(--sidebar-active-bg); color: var(--sidebar-active-text); }
  .nav-item svg { flex-shrink: 0; opacity: 0.75; }
  .nav-item.active svg { opacity: 1; }
  .nav-badge {
    margin-left: auto; background: #e53535; color: #fff;
    font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 20px;
  }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border2); flex-shrink: 0; }
  .main-content { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
  .topbar {
    position: sticky; top: 0; background: var(--topbar-bg);
    backdrop-filter: blur(16px); border-bottom: 1px solid var(--border2);
    z-index: 40; display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; height: 60px; gap: 16px;
  }
  .topbar-left { display: flex; align-items: center; gap: 12px; }
  .topbar-title { font-family: var(--font-serif); font-size: 22px; font-weight: 600; color: var(--text); }
  .topbar-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-light); margin-bottom: 2px; }
  .topbar-breadcrumb .crumb-active { color: var(--text); font-weight: 500; }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .icon-btn {
    width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--card); color: var(--text-mid);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; position: relative;
  }
  .icon-btn:hover { border-color: var(--green); color: var(--green); }
  .notif-dot {
    position: absolute; top: 6px; right: 6px;
    width: 7px; height: 7px; background: #e53535;
    border-radius: 50%; border: 1.5px solid var(--card);
  }
  .admin-avatar {
    width: 36px; height: 36px; border-radius: 50%; background: var(--green);
    color: #040d07; display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; cursor: pointer; flex-shrink: 0;
  }
  .hamburger {
    display: none; flex-direction: column; gap: 4px; cursor: pointer;
    padding: 6px; border-radius: 8px; border: 1px solid var(--border); background: var(--card);
  }
  .hamburger span { display: block; width: 16px; height: 1.5px; background: var(--text-mid); border-radius: 2px; }
  .page { padding: 28px; flex: 1; }
  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; margin-bottom: 28px;
  }
  .page-header-title { font-family: var(--font-serif); font-size: 28px; font-weight: 600; color: var(--text); line-height: 1.2; }
  .page-header-sub { font-size: 13px; color: var(--text-light); margin-top: 4px; }
  .page-header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .notif-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0; width: 320px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: 0 16px 48px rgba(0,0,0,0.18);
    z-index: 100; overflow: hidden;
  }
  .notif-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border2); }
  .notif-title { font-size: 13px; font-weight: 600; color: var(--text); }
  .notif-clear { font-size: 11px; color: var(--green); cursor: pointer; background: none; border: none; font-family: var(--font-sans); font-weight: 500; }
  .notif-item { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border2); cursor: pointer; transition: background 0.12s; }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: var(--bg3); }
  .notif-item.unread { background: rgba(29,184,122,0.04); }
  .notif-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .notif-body { flex: 1; min-width: 0; }
  .notif-msg { font-size: 12.5px; color: var(--text); line-height: 1.4; }
  .notif-time { font-size: 11px; color: var(--text-light); margin-top: 2px; }
  .notif-unread-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
  .user-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0; width: 220px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: 0 16px 48px rgba(0,0,0,0.18);
    z-index: 100; overflow: hidden; padding: 6px;
  }
  .user-info { padding: 12px 12px 10px; border-bottom: 1px solid var(--border2); margin-bottom: 4px; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .user-role { font-size: 11px; color: var(--text-light); margin-top: 1px; }
  .dropdown-item {
    display: flex; align-items: center; gap: 8px; padding: 8px 10px;
    border-radius: 8px; font-size: 13px; color: var(--text-mid); cursor: pointer;
    transition: background 0.12s, color 0.12s; border: none; background: none;
    width: 100%; text-align: left; font-family: var(--font-sans);
  }
  .dropdown-item:hover { background: var(--bg3); color: var(--text); }
  .dropdown-item.danger { color: #e53535; }
  .dropdown-item.danger:hover { background: rgba(229,53,53,0.08); }
  .dropdown-divider { height: 1px; background: var(--border2); margin: 4px 0; }
  .btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
    border-radius: 50px; font-size: 13px; font-weight: 600;
    font-family: var(--font-sans); cursor: pointer; transition: all 0.15s;
    border: none; white-space: nowrap;
  }
  .btn-primary { background: var(--green); color: #040d07; }
  .btn-primary:hover { background: #22d98e; transform: translateY(-1px); }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-mid); }
  .btn-outline:hover { border-color: var(--green); color: var(--green); }
  .btn-sm { padding: 5px 12px; font-size: 12px; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow); overflow: hidden; }
  .card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border2); }
  .card-title { font-size: 15px; font-weight: 600; color: var(--text); }
  .card-sub { font-size: 12px; color: var(--text-light); margin-top: 2px; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .main-content { margin-left: 0 !important; }
    .topbar { padding: 0 16px; }
    .page { padding: 16px; }
    .hamburger { display: flex; }
  }
`;

const Ic = ({ name, size = 16 }) => {
  const p = {
    dashboard: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    cashier: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    payments: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
    feedback: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p[name]}</svg>;
};

const mockNotifs = [
  { id: 1, msg: "Green Garden Café has an overdue payment of R199", time: "2 min ago", icon: "alert", iBg: "rgba(229,53,53,0.1)", iC: "#e53535", unread: true },
  { id: 2, msg: "New feedback — Incorrect charge on tab (John Doe)", time: "14 min ago", icon: "feedback", iBg: "rgba(59,130,246,0.1)", iC: "#3b82f6", unread: true },
  { id: 3, msg: "Corner Tuck Shop registered as a new cashier", time: "1 hr ago", icon: "cashier", iBg: "rgba(29,184,122,0.1)", iC: "#1db87a", unread: true },
  { id: 4, msg: "Mama's Kitchen May payment confirmed via Card", time: "3 hrs ago", icon: "check", iBg: "rgba(29,184,122,0.1)", iC: "#1db87a", unread: false },
  { id: 5, msg: "Quick Stop Spaza has been suspended", time: "Yesterday", icon: "shield", iBg: "rgba(234,179,8,0.1)", iC: "#eab308", unread: false },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", section: "MAIN" },
  { id: "accounts",  label: "Accounts",  icon: "users" },
  { id: "payments",  label: "Payments",  icon: "payments" },
  { id: "feedback",  label: "Feedback",  icon: "feedback", badge: 3 },
  { id: "settings",  label: "Settings",  icon: "settings", section: "SYSTEM" },
];

function NotifBell({ notifs, setNotifs }) {
  const [open, setOpen] = useState(false);
  const unread = notifs.filter(n => n.unread).length;
  return (
    <div style={{ position: "relative" }}>
      <div className="icon-btn" onClick={() => setOpen(o => !o)}>
        <Ic name="bell" size={16} />
        {unread > 0 && <span className="notif-dot" />}
      </div>
      {open && <>
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-title">Notifications {unread > 0 && <span style={{ background: "rgba(229,53,53,0.12)", color: "#e53535", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, marginLeft: 6 }}>{unread}</span>}</span>
            {unread > 0 && <button className="notif-clear" onClick={() => setNotifs(p => p.map(n => ({ ...n, unread: false })))}>Mark all read</button>}
          </div>
          {notifs.map(n => (
            <div key={n.id} className={`notif-item ${n.unread ? "unread" : ""}`} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, unread: false } : x))}>
              <div className="notif-icon" style={{ background: n.iBg, color: n.iC }}><Ic name={n.icon} size={14} /></div>
              <div className="notif-body">
                <div className="notif-msg">{n.msg}</div>
                <div className="notif-time">{n.time}</div>
              </div>
              {n.unread && <div className="notif-unread-dot" />}
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

function UserMenu({ dark, setDark }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div className="admin-avatar" onClick={() => setOpen(o => !o)}>A</div>
      {open && <>
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-name">Navoq Admin</div>
            <div className="user-role">Super Administrator</div>
          </div>
          <button className="dropdown-item"><Ic name="user" size={14} />My Profile</button>
          <button className="dropdown-item"><Ic name="settings" size={14} />Settings</button>
          <button className="dropdown-item" onClick={() => { setDark(d => !d); setOpen(false); }}>
            <Ic name={dark ? "sun" : "moon"} size={14} />{dark ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="dropdown-divider" />
          <button className="dropdown-item danger"><Ic name="logout" size={14} />Sign Out</button>
        </div>
      </>}
    </div>
  );
}

// ── THE LAYOUT COMPONENT ──────────────────────────────────────────────────────
function AdminLayout({ activePage, onNavigate, dark, setDark, breadcrumbs, pageActions, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState(mockNotifs);
  const activeItem = navItems.find(n => n.id === activePage);

  return (
    <>
      <style>{layoutStyles}</style>
      <div className={`admin-root ${dark ? "admin-dark" : "admin-light"}`}>

        {/* Mobile overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="logo-icon">N→</div>
            <div>
              <div className="logo-text">Navoq</div>
              <div className="logo-sub">ADMIN PANEL</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            {(() => {
              const els = []; let lastSec = null;
              navItems.forEach(item => {
                if (item.section && item.section !== lastSec) {
                  lastSec = item.section;
                  els.push(<div key={`s-${item.section}`} className="nav-section-label">{item.section}</div>);
                }
                els.push(
                  <button key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`}
                    onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}>
                    <Ic name={item.icon} size={16} />{item.label}
                    {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                  </button>
                );
              });
              return els;
            })()}
          </nav>
          <div className="sidebar-footer">
            <button className="nav-item" onClick={() => setDark(d => !d)}>
              <Ic name={dark ? "sun" : "moon"} size={16} />{dark ? "Light Mode" : "Dark Mode"}
            </button>
            <button className="nav-item" style={{ color: "#e53535" }}>
              <Ic name="logout" size={16} />Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-content">
          <header className="topbar">
            <div className="topbar-left">
              <div className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
                <span /><span /><span />
              </div>
              <div>
                {breadcrumbs?.length > 0 && (
                  <div className="topbar-breadcrumb">
                    {breadcrumbs.map((c, i) => (
                      <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {i > 0 && <Ic name="chevronRight" size={11} />}
                        <span className={i === breadcrumbs.length - 1 ? "crumb-active" : ""}>{c}</span>
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="topbar-title">{activeItem?.label}</h1>
              </div>
            </div>
            <div className="topbar-right">
              {pageActions}
              <div className="icon-btn" title="Refresh"><Ic name="refresh" size={16} /></div>
              <NotifBell notifs={notifs} setNotifs={setNotifs} />
              <UserMenu dark={dark} setDark={setDark} />
            </div>
          </header>
          <div className="page">{children}</div>
        </main>
      </div>
    </>
  );
}

// ── PAGE HEADER HELPER ────────────────────────────────────────────────────────
function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <div className="page-header-title">{title}</div>
        {subtitle && <div className="page-header-sub">{subtitle}</div>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
}

// ── DEMO PAGES ────────────────────────────────────────────────────────────────
const statCards = [
  { label: "TOTAL ACCOUNTS", val: "142", sub: "38 cashiers · 104 customers" },
  { label: "ACTIVE", val: "129", sub: "13 suspended", green: true },
  { label: "OPEN ISSUES", val: "11", sub: "87 resolved this month", red: true },
  { label: "MONTHLY REVENUE", val: "R28,450", sub: "R3,200 pending fees", green: true },
];

function DemoPage({ page }) {
  const info = {
    dashboard: { title: "Dashboard", sub: "Platform overview for Jun 2025" },
    accounts: { title: "Accounts", sub: "Manage cashier and customer accounts" },
    payments: { title: "Payment Allocations", sub: "Monthly fee tracking per cashier" },
    feedback: { title: "Feedback & Issues", sub: "Support inbox — 3 open threads" },
    settings: { title: "Settings", sub: "Platform configuration" },
  }[page] || { title: page, sub: "" };

  return (
    <>
      <PageHeader title={info.title} subtitle={info.sub}>
        <button className="btn btn-outline btn-sm">Export</button>
        <button className="btn btn-primary btn-sm">+ New</button>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", boxShadow: "var(--shadow)", transition: "border-color 0.2s, transform 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(29,184,122,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = ""; }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-light)", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 30, fontWeight: 700, lineHeight: 1, color: s.green ? "var(--green)" : s.red ? "#e53535" : "var(--text)" }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AdminLayout — how to use</div>
              <div className="card-sub">Drop-in shell for all your pages</div>
            </div>
          </div>
          <div style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "dashboard", label: "Sidebar", desc: "Nav items with section labels, badges, active state" },
                { icon: "bell",      label: "Notifications", desc: "Live dropdown with unread count & mark-all-read" },
                { icon: "user",      label: "User Menu", desc: "Profile, settings, dark mode toggle, sign out" },
                { icon: "moon",      label: "Dark Mode", desc: "Full theme switch via sidebar or user menu" },
                { icon: "settings",  label: "Mobile ready", desc: "Hamburger + overlay at ≤768 px" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-light)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic name={f.icon} size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-light)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Usage snippet</div>
            <div className="card-sub">AdminLayout.jsx</div>
          </div>
          <div style={{ padding: "20px 22px" }}>
            <pre style={{ fontSize: 11.5, color: "var(--text-mid)", lineHeight: 1.75, overflowX: "auto", fontFamily: "'DM Mono', 'Fira Code', monospace", background: "var(--bg3)", padding: "14px 16px", borderRadius: 10 }}>{`import AdminLayout, {
  PageHeader
} from "./AdminLayout";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(false);

  return (
    <AdminLayout
      activePage={page}
      onNavigate={setPage}
      dark={dark}
      setDark={setDark}
      breadcrumbs={["Navoq", "Dashboard"]}
      pageActions={
        <button className="btn btn-primary btn-sm">
          + New
        </button>
      }
    >
      <PageHeader
        title="Dashboard"
        subtitle="Overview"
      >
        <button>Export</button>
      </PageHeader>

      {/* your page content */}
    </AdminLayout>
  );
}`}</pre>
          </div>
        </div>
      </div>
    </>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(false);

  return (
    <AdminLayout
      activePage={page}
      onNavigate={setPage}
      dark={dark}
      setDark={setDark}
      breadcrumbs={["Navoq Admin", navItems.find(n => n.id === page)?.label ?? page]}
      pageActions={
        <button className="btn btn-primary btn-sm">+ Quick Action</button>
      }
    >
      <DemoPage page={page} />
    </AdminLayout>
  );
}