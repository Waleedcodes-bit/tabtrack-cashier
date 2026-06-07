import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavoqLogo from "../../assets/NavoqLogo.png";
import { supabase } from "../../lib/supabase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .aa-root { min-height: 100vh; display: flex; background: #080f0b; font-family: 'DM Sans', sans-serif; position: relative; overflow: hidden; }
  .aa-brand img { width: 36px; height: 36px; border-radius: 9px; object-fit: cover; flex-shrink: 0; }
  .aa-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
  .aa-orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.18; }
  .aa-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #1db87a, transparent); top: -200px; left: -200px; animation: aaFloat 8s ease-in-out infinite; }
  .aa-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #0d5c3a, transparent); bottom: -100px; right: -100px; animation: aaFloat 6s ease-in-out infinite reverse; }
  .aa-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(29,184,122,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(29,184,122,0.03) 1px, transparent 1px); background-size: 48px 48px; }
  @keyframes aaFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }
  .aa-left { flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 48px; position: relative; z-index: 1; }
  .aa-brand { display: flex; align-items: center; gap: 12px; }
  .aa-brand-name { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #eef2ee; }
  .aa-brand-sub { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; color: #1db87a; margin-top: -2px; }
  .aa-hero { max-width: 480px; }
  .aa-hero-tag { display: inline-flex; align-items: center; gap: 7px; border: 1px solid rgba(29,184,122,0.2); border-radius: 50px; padding: 5px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: #1db87a; background: rgba(29,184,122,0.06); margin-bottom: 24px; }
  .aa-hero-dot { width: 6px; height: 6px; border-radius: 50%; background: #1db87a; animation: aaPulse 2s infinite; }
  @keyframes aaPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
  .aa-hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(40px, 5vw, 64px); font-weight: 700; line-height: 1.05; color: #ffffff; margin-bottom: 20px; }
  .aa-hero-title em { font-style: italic; color: #1db87a; }
  .aa-hero-desc { font-size: 15px; color: #8fa98f; line-height: 1.7; margin-bottom: 40px; max-width: 400px; }
  .aa-stats { display: flex; gap: 32px; }
  .aa-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; color: #ffffff; line-height: 1; }
  .aa-stat-label { font-size: 11px; color: #4d6b55; margin-top: 3px; }
  .aa-stat-div { width: 1px; background: rgba(29,184,122,0.15); align-self: stretch; }
  .aa-left-footer { font-size: 12px; color: #4d6b55; }
  .aa-right { width: 480px; flex-shrink: 0; background: #f5f7f4; display: flex; align-items: center; justify-content: center; padding: 48px 40px; position: relative; z-index: 1; }
  .aa-right::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, rgba(29,184,122,0.3) 30%, rgba(29,184,122,0.3) 70%, transparent); }
  .aa-form-wrap { width: 100%; max-width: 360px; }
  .aa-lock-wrap { width: 56px; height: 56px; background: #ffffff; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e8ede8; }
  .aa-form-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600; color: #1a2b1f; margin-bottom: 6px; }
  .aa-form-sub { font-size: 13.5px; color: #6b8870; margin-bottom: 32px; line-height: 1.5; }
  .aa-security { display: flex; align-items: center; gap: 10px; background: rgba(29,184,122,0.07); border: 1px solid rgba(29,184,122,0.18); border-radius: 10px; padding: 10px 14px; margin-bottom: 28px; }
  .aa-security-icon { width: 28px; height: 28px; background: rgba(29,184,122,0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #16935f; flex-shrink: 0; }
  .aa-security-text { font-size: 12px; color: #3d6b4a; line-height: 1.4; }
  .aa-security-text strong { font-weight: 600; display: block; margin-bottom: 1px; }
  .aa-field { margin-bottom: 16px; }
  .aa-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; color: #4d6b55; margin-bottom: 7px; }
  .aa-input-wrap { position: relative; }
  .aa-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #8fa98f; pointer-events: none; display: flex; }
  .aa-input { width: 100%; background: #ffffff; border: 1.5px solid #dde8dd; border-radius: 10px; padding: 11px 14px 11px 40px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a2b1f; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .aa-input:focus { border-color: #1db87a; box-shadow: 0 0 0 3px rgba(29,184,122,0.1); }
  .aa-input::placeholder { color: #b0c4b0; }
  .aa-input-right { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #8fa98f; background: none; border: none; display: flex; padding: 4px; transition: color 0.2s; }
  .aa-input-right:hover { color: #1db87a; }
  .aa-error { display: flex; align-items: center; gap: 7px; background: rgba(229,53,53,0.07); border: 1px solid rgba(229,53,53,0.2); border-radius: 8px; padding: 9px 12px; font-size: 12.5px; color: #c02020; margin-bottom: 16px; animation: aaShake 0.3s ease; }
  @keyframes aaShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
  .aa-submit { width: 100%; padding: 13px; background: #1a2b1f; color: #ffffff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; margin-top: 20px; position: relative; overflow: hidden; }
  .aa-submit::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(29,184,122,0.15), transparent); opacity: 0; transition: opacity 0.2s; }
  .aa-submit:hover::before { opacity: 1; }
  .aa-submit:hover { background: #0f1f14; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
  .aa-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .aa-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: aaSpin 0.7s linear infinite; }
  @keyframes aaSpin { to { transform: rotate(360deg); } }
  .aa-back { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: #8fa98f; margin-top: 20px; cursor: pointer; transition: color 0.2s; background: none; border: none; font-family: 'DM Sans', sans-serif; padding: 0; }
  .aa-back:hover { color: #1db87a; }
  @media (max-width: 900px) {
    .aa-left { display: none; }
    .aa-right { width: 100%; background: #080f0b; }
    .aa-right::before { display: none; }
    .aa-form-title { color: #ffffff; }
    .aa-form-sub { color: #8fa98f; }
    .aa-lock-wrap { background: #0f1f16; border-color: rgba(29,184,122,0.2); }
    .aa-security { background: rgba(29,184,122,0.06); }
    .aa-security-text { color: #8fa98f; }
    .aa-input { background: #0f1f16; border-color: rgba(29,184,122,0.2); color: #eef2ee; }
    .aa-input:focus { border-color: #1db87a; box-shadow: 0 0 0 3px rgba(29,184,122,0.12); }
    .aa-input::placeholder { color: #4d6b55; }
    .aa-label { color: #8fa98f; }
    .aa-submit { background: #1db87a; color: #040d07; }
    .aa-submit:hover { background: #22d98e; }
  }
`;

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1db87a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const KeyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);
const EyeIcon = ({ off }) => off ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

export default function AdminAuth() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    // Sign in with Supabase
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Invalid credentials. Access denied.");
      setLoading(false);
      return;
    }

    // Verify the user is actually an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      setError("Access denied. Admin accounts only.");
      setLoading(false);
      return;
    }

    navigate("/admin/dashboard");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="aa-root">
        <div className="aa-bg">
          <div className="aa-orb aa-orb-1" />
          <div className="aa-orb aa-orb-2" />
          <div className="aa-grid" />
        </div>

        <div className="aa-left">
          <div className="aa-brand">
            <img src={NavoqLogo} alt="Navoq logo" />
            <div>
              <div className="aa-brand-name">Navoq</div>
              <div className="aa-brand-sub">ADMIN CONSOLE</div>
            </div>
          </div>
          <div className="aa-hero">
            <div className="aa-hero-tag"><span className="aa-hero-dot" />Restricted Access</div>
            <h1 className="aa-hero-title">Platform<br />Control<br /><em>Centre.</em></h1>
            <p className="aa-hero-desc">Full visibility and control over every restaurant, customer, tab, and transaction on the Navoq network.</p>
            <div className="aa-stats">
              <div><div className="aa-stat-num">100%</div><div className="aa-stat-label">Platform Visibility</div></div>
              <div className="aa-stat-div" />
              <div><div className="aa-stat-num">Live</div><div className="aa-stat-label">Data Sync</div></div>
              <div className="aa-stat-div" />
              <div><div className="aa-stat-num">Secure</div><div className="aa-stat-label">Encrypted Access</div></div>
            </div>
          </div>
          <div className="aa-left-footer">© 2025 Nidaam Labs (Pty) Ltd · Navoq v1.0</div>
        </div>

        <div className="aa-right">
          <div className="aa-form-wrap">
            <div className="aa-lock-wrap"><LockIcon /></div>
            <div className="aa-form-title">Admin Login</div>
            <div className="aa-form-sub">Restricted to authorised Navoq administrators only.</div>

            <div className="aa-security">
              <div className="aa-security-icon"><ShieldIcon /></div>
              <div className="aa-security-text">
                <strong>Secure area</strong>
                All sessions are logged and monitored.
              </div>
            </div>

            {error && <div className="aa-error"><AlertIcon />{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="aa-field">
                <label className="aa-label">EMAIL ADDRESS</label>
                <div className="aa-input-wrap">
                  <span className="aa-input-icon"><MailIcon /></span>
                  <input type="email" className="aa-input" placeholder="admin@navoq.co.za"
                    value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </div>
              </div>

              <div className="aa-field">
                <label className="aa-label">PASSWORD</label>
                <div className="aa-input-wrap">
                  <span className="aa-input-icon"><KeyIcon /></span>
                  <input type={showPw ? "text" : "password"} className="aa-input" placeholder="••••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                  <button type="button" className="aa-input-right" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                    <EyeIcon off={showPw} />
                  </button>
                </div>
              </div>

              <button type="submit" className={`aa-submit ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? <><span className="aa-spinner" />Verifying...</> : <>Access Admin Panel<ArrowIcon /></>}
              </button>
            </form>

            <button className="aa-back" onClick={() => navigate("/")}>
              <BackIcon />Back to portal selection
            </button>
          </div>
        </div>
      </div>
    </>
  );
}