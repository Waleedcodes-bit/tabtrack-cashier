import { useState, createContext, useContext } from "react";


// ─── LAYOUT STYLES ────────────────────────────────────────────────────────────
const layoutStyles = `
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
    --bg: #f7f8f6;
    --bg2: #ffffff;
    --bg3: #eef1ec;
    --card: #ffffff;
    --border: rgba(0,0,0,0.08);
    --border2: rgba(0,0,0,0.05);
    --text: #1a2b1f;
    --text-mid: #4d6b55;
    --text-light: #8fa98f;
    --shadow: 0 2px 16px rgba(0,0,0,0.06);
    --sidebar-bg: #ffffff;
    --sidebar-text: #4d6b55;
    --sidebar-active-bg: rgba(29,184,122,0.1);
    --sidebar-active-text: #0f6b3c;
    --topbar-bg: rgba(247,248,246,0.92);
  }

  .admin-dark {
    --bg: #080f0b;
    --bg2: #0d1a12;
    --bg3: #0a1510;
    --card: #0f1f16;
    --border: rgba(29,184,122,0.12);
    --border2: rgba(255,255,255,0.06);
    --text: #eef2ee;
    --text-mid: #8fa98f;
    --text-light: #4d6b55;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --sidebar-bg: #0a1510;
    --sidebar-text: #8fa98f;
    --sidebar-active-bg: rgba(29,184,122,0.12);
    --sidebar-active-text: #1db87a;
    --topbar-bg: rgba(8,15,11,0.92);
  }

  /* ── ROOT ── */
  .admin-root {
    font-family: var(--font-sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    font-size: 14px;
    line-height: 1.6;
    transition: background 0.3s, color 0.3s;
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 50;
    transition: background 0.3s, border-color 0.3s, transform 0.3s;
  }

  /* Mobile overlay */
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 49;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--border2);
    flex-shrink: 0;
  }

  .logo-icon {
    width: 34px; height: 34px;
    background: var(--green);
    color: #040d07;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-sans);
    font-size: 11px; font-weight: 700;
    flex-shrink: 0;
  }

  .logo-text {
    font-family: var(--font-serif);
    font-size: 18px; font-weight: 600;
    color: var(--text);
  }

  .logo-sub {
    font-size: 10px;
    color: var(--text-light);
    letter-spacing: 0.08em;
    font-weight: 600;
    margin-top: -2px;
  }

  .sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
  }

  .nav-section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: var(--text-light);
    padding: 10px 8px 6px;
    margin-top: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    cursor: pointer;
    color: var(--sidebar-text);
    font-size: 13.5px;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: var(--font-sans);
    text-decoration: none;
  }

  .nav-item:hover {
    background: var(--bg3);
    color: var(--text);
  }

  .nav-item.active {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-active-text);
  }

  .nav-item svg { flex-shrink: 0; opacity: 0.75; }
  .nav-item.active svg { opacity: 1; }

  .nav-badge {
    margin-left: auto;
    background: #e53535;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: 20px;
  }

  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid var(--border2);
    flex-shrink: 0;
  }

  /* ── MAIN ── */
  .main-content {
    margin-left: var(--sidebar-w);
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    transition: margin-left 0.3s;
  }

  /* ── TOPBAR ── */
  .topbar {
    position: sticky; top: 0;
    background: var(--topbar-bg);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border2);
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    height: 60px;
    gap: 16px;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .topbar-title {
    font-family: var(--font-serif);
    font-size: 22px;
    font-weight: 600;
    color: var(--text);
  }

  .topbar-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-light);
  }

  .topbar-breadcrumb span { color: var(--text-mid); }
  .topbar-breadcrumb .crumb-sep { color: var(--border); }
  .topbar-breadcrumb .crumb-active { color: var(--text); font-weight: 500; }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon-btn {
    width: 36px; height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text-mid);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  }

  .icon-btn:hover { border-color: var(--green); color: var(--green); }

  .icon-btn .notif-dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: #e53535;
    border-radius: 50%;
    border: 1.5px solid var(--card);
  }

  .admin-avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: var(--green);
    color: #040d07;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
  }

  .admin-avatar-lg {
    width: 40px; height: 40px;
    font-size: 14px;
  }

  /* ── HAMBURGER (mobile) ── */
  .hamburger {
    display: none;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card);
    transition: border-color 0.15s;
  }
  .hamburger:hover { border-color: var(--green); }
  .hamburger span {
    display: block;
    width: 16px; height: 1.5px;
    background: var(--text-mid);
    border-radius: 2px;
    transition: all 0.2s;
  }

  /* ── PAGE CONTENT ── */
  .page {
    padding: 28px;
    flex: 1;
  }

  /* ── PAGE HEADER (slot) ── */
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
  }

  .page-header-title {
    font-family: var(--font-serif);
    font-size: 28px;
    font-weight: 600;
    color: var(--text);
    line-height: 1.2;
  }

  .page-header-sub {
    font-size: 13px;
    color: var(--text-light);
    margin-top: 4px;
  }

  .page-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  /* ── NOTIFICATION DROPDOWN ── */
  .notif-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 320px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: 0 16px 48px rgba(0,0,0,0.18);
    z-index: 100;
    overflow: hidden;
  }

  .notif-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border2);
  }

  .notif-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  .notif-clear {
    font-size: 11px;
    color: var(--green);
    cursor: pointer;
    background: none;
    border: none;
    font-family: var(--font-sans);
    font-weight: 500;
  }

  .notif-item {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border2);
    cursor: pointer;
    transition: background 0.12s;
  }

  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: var(--bg3); }

  .notif-item.unread { background: rgba(29,184,122,0.04); }

  .notif-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .notif-body { flex: 1; min-width: 0; }
  .notif-msg { font-size: 12.5px; color: var(--text); line-height: 1.4; }
  .notif-time { font-size: 11px; color: var(--text-light); margin-top: 2px; }
  .notif-unread-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; flex-shrink: 0; margin-top: 6px; }

  /* ── USER DROPDOWN ── */
  .user-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 220px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: 0 16px 48px rgba(0,0,0,0.18);
    z-index: 100;
    overflow: hidden;
    padding: 6px;
  }

  .user-info {
    padding: 12px 12px 10px;
    border-bottom: 1px solid var(--border2);
    margin-bottom: 4px;
  }

  .user-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .user-role { font-size: 11px; color: var(--text-light); margin-top: 1px; }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 13px;
    color: var(--text-mid);
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: var(--font-sans);
  }

  .dropdown-item:hover { background: var(--bg3); color: var(--text); }
  .dropdown-item.danger { color: #e53535; }
  .dropdown-item.danger:hover { background: rgba(229,53,53,0.08); color: #e53535; }
  .dropdown-divider { height: 1px; background: var(--border2); margin: 4px 0; }

  /* ── REUSABLE TOKENS (shared with pages) ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 50px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-sans);
    cursor: pointer; transition: all 0.15s;
    border: none; white-space: nowrap;
  }
  .btn-primary { background: var(--green); color: #040d07; }
  .btn-primary:hover { background: #22d98e; transform: translateY(-1px); }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-mid); }
  .btn-outline:hover { border-color: var(--green); color: var(--green); }
  .btn-sm { padding: 5px 12px; font-size: 12px; }

  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow); overflow: hidden;
  }

  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid var(--border2);
  }

  .card-title { font-size: 15px; font-weight: 600; color: var(--text); }
  .card-sub { font-size: 12px; color: var(--text-light); margin-top: 2px; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-light); }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .main-content { margin-left: 0 !important; }
    .topbar { padding: 0 16px; }
    .page { padding: 16px; }
    .hamburger { display: flex; }
    .topbar-breadcrumb { display: none; }
  }
`;

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
export const LayoutContext = createContext({
  dark: false,
  setDark: () => {},
  activePage: "",
  setActivePage: () => {},
});

export const useLayout = () => useContext(LayoutContext);

// ─── ICON ────────────────────────────────────────────────────────────────────
export const Icon = ({ name, size = 16 }) => {
  const icons = {
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
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── MOCK NOTIFICATIONS ───────────────────────────────────────────────────────
const mockNotifications = [
  { id: 1, msg: "Green Garden Café has an overdue payment of R199", time: "2 min ago", icon: "alert", iconBg: "rgba(229,53,53,0.1)", iconColor: "#e53535", unread: true },
  { id: 2, msg: "New feedback from John Doe — Incorrect charge on tab", time: "14 min ago", icon: "feedback", iconBg: "rgba(59,130,246,0.1)", iconColor: "#3b82f6", unread: true },
  { id: 3, msg: "Corner Tuck Shop registered as a new cashier", time: "1 hr ago", icon: "cashier", iconBg: "rgba(29,184,122,0.1)", iconColor: "#1db87a", unread: true },
  { id: 4, msg: "Mama's Kitchen May payment confirmed via Card", time: "3 hrs ago", icon: "check", iconBg: "rgba(29,184,122,0.1)", iconColor: "#1db87a", unread: false },
  { id: 5, msg: "Quick Stop Spaza has been suspended", time: "Yesterday", icon: "shield", iconBg: "rgba(234,179,8,0.1)", iconColor: "#eab308", unread: false },
];

// ─── NOTIFICATION BELL ────────────────────────────────────────────────────────
function NotificationBell({ notifications, setNotifications }) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <div style={{ position: "relative" }}>
      <div className="icon-btn" onClick={() => setOpen(o => !o)}>
        <Icon name="bell" size={16} />
        {unreadCount > 0 && <span className="notif-dot" />}
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div className="notif-dropdown">
            <div className="notif-header">
              <span className="notif-title">Notifications {unreadCount > 0 && <span style={{ background: "rgba(229,53,53,0.12)", color: "#e53535", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, marginLeft: 6 }}>{unreadCount}</span>}</span>
              {unreadCount > 0 && <button className="notif-clear" onClick={markAllRead}>Mark all read</button>}
            </div>
            {notifications.map(n => (
              <div key={n.id} className={`notif-item ${n.unread ? "unread" : ""}`}
                onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}>
                <div className="notif-icon" style={{ background: n.iconBg, color: n.iconColor }}>
                  <Icon name={n.icon} size={14} />
                </div>
                <div className="notif-body">
                  <div className="notif-msg">{n.msg}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
                {n.unread && <div className="notif-unread-dot" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── USER MENU ────────────────────────────────────────────────────────────────
function UserMenu({ user, dark, setDark }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div className="admin-avatar admin-avatar-lg" onClick={() => setOpen(o => !o)} title={user.name}>
        {user.initials}
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div className="user-dropdown">
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <button className="dropdown-item"><Icon name="user" size={14} />My Profile</button>
            <button className="dropdown-item"><Icon name="settings" size={14} />Settings</button>
            <button className="dropdown-item" onClick={() => { setDark(d => !d); setOpen(false); }}>
              <Icon name={dark ? "sun" : "moon"} size={14} />{dark ? "Light Mode" : "Dark Mode"}
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item danger"><Icon name="logout" size={14} />Sign Out</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ADMIN LAYOUT ─────────────────────────────────────────────────────────────
/**
 * AdminLayout
 *
 * Props:
 * - navItems: Array<{ id, label, icon, badge?, section? }>
 *   Define your nav items. Use `section` to insert a section label above a group.
 * - activePage: string — currently active nav item id
 * - onNavigate: (id: string) => void — called when a nav item is clicked
 * - title: string — topbar title (falls back to the active nav item label)
 * - breadcrumbs: Array<string> — optional breadcrumb trail shown in topbar
 * - pageActions: ReactNode — optional action buttons shown in the topbar right area
 * - logo: { icon, text, sub } — logo config (defaults to Navoq branding)
 * - user: { name, initials, role } — user info for the avatar menu
 * - dark: boolean — dark mode state
 * - setDark: (fn) => void — dark mode setter
 * - children: ReactNode — page content
 */
export default function AdminLayout({
  navItems = defaultNavItems,
  activePage = "dashboard",
  onNavigate = () => {},
  title,
  breadcrumbs,
  pageActions,
  logo = defaultLogo,
  user = defaultUser,
  dark = false,
  setDark = () => {},
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const activeItem = navItems.find(n => n.id === activePage);
  const displayTitle = title ?? activeItem?.label ?? "";

  const handleNav = (id) => {
    onNavigate(id);
    setSidebarOpen(false);
  };

  return (
    <LayoutContext.Provider value={{ dark, setDark, activePage, setActivePage: onNavigate }}>
      <style>{layoutStyles}</style>
      <div className={`admin-root ${dark ? "admin-dark" : "admin-light"}`}>

        {/* ── Mobile overlay ── */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="logo-icon">{logo.icon}</div>
            <div>
              <div className="logo-text">{logo.text}</div>
              <div className="logo-sub">{logo.sub}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {renderNavItems(navItems, activePage, handleNav)}
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item" onClick={() => setDark(d => !d)}>
              <Icon name={dark ? "sun" : "moon"} size={16} />
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
            <button className="nav-item" style={{ color: "#e53535" }}>
              <Icon name="logout" size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-content">

          {/* ── Topbar ── */}
          <header className="topbar">
            <div className="topbar-left">
              {/* Hamburger (mobile) */}
              <div className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
                <span /><span /><span />
              </div>

              <div>
                {breadcrumbs?.length > 0 ? (
                  <div className="topbar-breadcrumb">
                    {breadcrumbs.map((crumb, i) => (
                      <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {i > 0 && <span className="crumb-sep"><Icon name="chevronRight" size={12} /></span>}
                        <span className={i === breadcrumbs.length - 1 ? "crumb-active" : ""}>{crumb}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
                <h1 className="topbar-title">{displayTitle}</h1>
              </div>
            </div>

            <div className="topbar-right">
              {/* Page-level action buttons (optional slot) */}
              {pageActions}

              {/* Refresh */}
              <div className="icon-btn" title="Refresh">
                <Icon name="refresh" size={16} />
              </div>

              {/* Notifications */}
              <NotificationBell notifications={notifications} setNotifications={setNotifications} />

              {/* User menu */}
              <UserMenu user={user} dark={dark} setDark={setDark} />
            </div>
          </header>

          {/* ── Page content ── */}
          <div className="page">
            {children}
          </div>
        </main>

      </div>
    </LayoutContext.Provider>
  );
}

// ─── RENDER NAV ITEMS (handles section labels) ────────────────────────────────
function renderNavItems(navItems, activePage, onNavigate) {
  const elements = [];
  let lastSection = null;

  navItems.forEach((item) => {
    if (item.section && item.section !== lastSection) {
      lastSection = item.section;
      elements.push(
        <div key={`section-${item.section}`} className="nav-section-label">
          {item.section}
        </div>
      );
    }
    elements.push(
      <button
        key={item.id}
        className={`nav-item ${activePage === item.id ? "active" : ""}`}
        onClick={() => onNavigate(item.id)}
      >
        <Icon name={item.icon} size={16} />
        {item.label}
        {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
      </button>
    );
  });

  return elements;
}

// ─── PAGE HEADER HELPER ───────────────────────────────────────────────────────
/**
 * PageHeader — a standardised header for use inside page components.
 * Renders a title + optional subtitle + optional action buttons.
 */
export function PageHeader({ title, subtitle, children }) {
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

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────
const defaultLogo = { icon: "N→", text: "Navoq", sub: "ADMIN PANEL" };
const defaultUser = { name: "Navoq Admin", initials: "A", role: "Super Administrator" };

const defaultNavItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", section: "MAIN" },
  { id: "accounts",  label: "Accounts",  icon: "users" },
  { id: "customers", label: "Customers", icon: "user" },
  { id: "payments",  label: "Payments",  icon: "payments" },
  { id: "feedback",  label: "Feedback",  icon: "feedback", badge: 3 },
  { id: "reports",   label: "Reports",   icon: "chart", section: "ANALYTICS" },
  { id: "settings",  label: "Settings",  icon: "settings", section: "SYSTEM" },
];

