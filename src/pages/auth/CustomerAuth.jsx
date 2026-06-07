import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavoqLogo from "../../assets/NavoqLogo.png";
import { supabase } from "../../lib/supabase";

const styles = `
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --green-deep: #061a12; --green-dark: #0a2318; --green-mid: #0f3524; --green-accent: #1db87a; --green-light: #2dd881; --green-muted: #4a8c6a; --green-faint: #1a4a30; --white: #ffffff; --off-white: #f8f8f6; --border: #e8e8e4; --text-dark: #0f1f18; --text-mid: #4a5a52; --text-light: #8a9a92; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px; }
  html, body { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--off-white); }
  .ca-layout { display: flex; min-height: 100vh; }
  .ca-hero { width: 46%; background: var(--green-deep); position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 2.5rem 3rem; }
  .ca-hero::before { content: ''; position: absolute; top: -80px; right: -120px; width: 600px; height: 600px; border-radius: 50%; border: 1px solid rgba(29,184,122,0.12); pointer-events: none; }
  .ca-hero::after { content: ''; position: absolute; top: -40px; right: -180px; width: 700px; height: 700px; border-radius: 50%; border: 1px solid rgba(29,184,122,0.07); pointer-events: none; }
  .ca-arc3 { position: absolute; top: 20px; right: -230px; width: 800px; height: 800px; border-radius: 50%; border: 1px solid rgba(29,184,122,0.05); pointer-events: none; }
  .ca-brand { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .ca-brand-logo { width: 42px; height: 42px; flex-shrink: 0; }
  .ca-brand-text { display: flex; flex-direction: column; line-height: 1; }
  .ca-brand-name { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 600; color: var(--white); letter-spacing: -0.01em; }
  .ca-brand-tag { font-size: 12px; font-weight: 500; color: var(--green-accent); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 3px; }
  .ca-hero-body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 3rem 0; position: relative; z-index: 1; }
  .ca-hero-headline { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 500; color: var(--white); line-height: 1.15; margin-bottom: 1.25rem; letter-spacing: -0.01em; }
  .ca-hero-divider { width: 36px; height: 3px; background: var(--green-accent); border-radius: 2px; margin-bottom: 1.25rem; }
  .ca-hero-sub { font-size: 15px; color: #7ab49a; line-height: 1.65; max-width: 320px; font-weight: 300; }
  .ca-features { display: flex; gap: 0; margin-top: auto; padding-top: 2.5rem; position: relative; z-index: 1; }
  .ca-feature { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 1rem 0.5rem; border-right: 0.5px solid rgba(255,255,255,0.08); }
  .ca-feature:last-child { border-right: none; }
  .ca-feature-icon-wrap { width: 44px; height: 44px; border-radius: 10px; background: rgba(29,184,122,0.12); display: flex; align-items: center; justify-content: center; }
  .ca-feature-icon-wrap svg { width: 20px; height: 20px; stroke: var(--green-accent); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .ca-feature-label { font-size: 12px; color: #7ab49a; font-weight: 400; text-align: center; }
  .ca-hero-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #3a6a50; padding-top: 1.5rem; position: relative; z-index: 1; }
  .ca-hero-footer a { color: #3a6a50; text-decoration: none; transition: color 0.2s; }
  .ca-hero-footer a:hover { color: var(--green-accent); }
  .ca-footer-links { display: flex; align-items: center; }
  .ca-footer-sep { margin: 0 10px; opacity: 0.5; }
  .ca-auth-panel { width: 54%; background: var(--off-white); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; position: relative; }
  .ca-back-btn { position: absolute; top: 1.5rem; left: 1.5rem; width: 36px; height: 36px; border: 0.5px solid var(--border); border-radius: 9px; background: var(--white); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-mid); transition: border-color 0.2s, box-shadow 0.2s; }
  .ca-back-btn:hover { border-color: #ccc; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .ca-back-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .ca-card { background: var(--white); border-radius: var(--radius-xl); border: 0.5px solid var(--border); padding: 1.5rem 2.25rem 1.5rem; width: 100%; max-width: 420px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
  .ca-card-avatar { width: 52px; height: 52px; border-radius: 50%; background: #e6f5ed; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.85rem; }
  .ca-card-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 500; color: var(--text-dark); text-align: center; margin-bottom: 4px; letter-spacing: -0.01em; }
  .ca-card-sub { font-size: 13.5px; color: var(--text-light); text-align: center; margin-bottom: 1rem; font-weight: 300; }
  .ca-tabs { display: flex; background: #f1f1ee; border-radius: var(--radius-md); padding: 4px; margin-bottom: 1rem; gap: 4px; }
  .ca-tab { flex: 1; height: 38px; border: none; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--text-light); }
  .ca-tab.active { background: var(--green-deep); color: var(--white); box-shadow: 0 1px 6px rgba(0,0,0,0.15); }
  .ca-tab:not(.active):hover { color: var(--text-mid); }
  .ca-field { margin-bottom: 0.65rem; }
  .ca-field-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-mid); margin-bottom: 5px; }
  .ca-input-wrap { position: relative; display: flex; align-items: center; }
  .ca-input-icon { position: absolute; left: 13px; width: 16px; height: 16px; stroke: #bbb; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
  .ca-field input[type="email"], .ca-field input[type="password"], .ca-field input[type="text"] { width: 100%; height: 42px; padding: 0 42px; border: 1px solid var(--border); border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: var(--text-dark); background: var(--white); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .ca-field input::placeholder { color: #c0c8c4; }
  .ca-field input:focus { border-color: var(--green-accent); box-shadow: 0 0 0 3px rgba(29,184,122,0.1); }
  .ca-eye-btn { position: absolute; right: 13px; background: none; border: none; cursor: pointer; color: #bbb; display: flex; align-items: center; padding: 0; transition: color 0.2s; }
  .ca-eye-btn:hover { color: var(--text-mid); }
  .ca-eye-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .ca-remember-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .ca-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--text-mid); user-select: none; }
  .ca-custom-checkbox { width: 18px; height: 18px; border-radius: 5px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s, border 0.2s; }
  .ca-custom-checkbox svg { width: 11px; height: 11px; stroke: #fff; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
  .ca-custom-checkbox.small { width: 16px; height: 16px; margin-top: 2px; }
  .ca-forgot-link { font-size: 13px; font-weight: 500; color: var(--green-accent); text-decoration: none; transition: opacity 0.2s; }
  .ca-forgot-link:hover { opacity: 0.75; }
  .ca-btn-submit { width: 100%; height: 46px; background: var(--green-deep); color: var(--white); border: none; border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.15s; letter-spacing: 0.01em; }
  .ca-btn-submit:hover:not(:disabled) { background: #0d2e1e; }
  .ca-btn-submit:active:not(:disabled) { transform: scale(0.99); }
  .ca-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .ca-btn-submit svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .ca-error-msg { background: rgba(229,53,53,0.08); border: 1px solid rgba(229,53,53,0.2); color: #c0392b; font-size: 13px; border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 0.75rem; text-align: center; }
  .ca-success-msg { background: rgba(29,184,122,0.08); border: 1px solid rgba(29,184,122,0.2); color: #0f7a50; font-size: 13px; border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 0.75rem; text-align: center; }
  .ca-security-note { display: flex; align-items: flex-start; gap: 14px; margin-top: 1.5rem; max-width: 420px; width: 100%; }
  .ca-security-icon { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d4e8dc; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ca-security-icon svg { width: 18px; height: 18px; stroke: var(--green-accent); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .ca-security-text { padding-top: 2px; }
  .ca-security-title { font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 2px; }
  .ca-security-desc { font-size: 12px; color: var(--text-light); line-height: 1.5; }
  .ca-reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ca-pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
  .ca-strength-bars { display: flex; gap: 4px; }
  .ca-sbar { width: 36px; height: 3px; border-radius: 2px; background: var(--border); transition: background 0.3s; }
  .ca-sbar.weak { background: #e24b4a; } .ca-sbar.fair { background: #ef9f27; } .ca-sbar.good { background: #1db87a; } .ca-sbar.strong { background: #0a2e25; }
  .ca-strength-label { font-size: 11px; color: var(--text-light); }
  .ca-match-msg { font-size: 11.5px; margin-top: 3px; min-height: 14px; }
  .ca-match-msg.ok { color: var(--green-accent); } .ca-match-msg.err { color: #e24b4a; }
  .ca-terms-label { display: flex; align-items: flex-start; gap: 9px; font-size: 13px; color: var(--text-mid); cursor: pointer; margin-bottom: 0; line-height: 1.5; }
  @media (max-width: 820px) { .ca-layout { flex-direction: column; } .ca-hero { width: 100%; padding: 2rem; min-height: auto; } .ca-auth-panel { width: 100%; min-height: auto; } .ca-hero-headline { font-size: 32px; } .ca-reg-grid { grid-template-columns: 1fr; } }
`;

const EyeOffIcon = () => (<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);
const EyeOnIcon = () => (<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
const Checkbox = ({ checked, small }) => (
  <div className={`ca-custom-checkbox${small ? " small" : ""}`} style={{ background: checked ? "var(--green-deep)" : "transparent", border: checked ? "none" : "1.5px solid #ccc" }}>
    <svg viewBox="0 0 12 12" style={{ opacity: checked ? 1 : 0 }}><polyline points="2,6 5,9 10,3" /></svg>
  </div>
);

function getStrength(val) {
  if (!val) return { score: 0, label: "Enter a password", color: "var(--text-light)" };
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const labels = ["Too weak", "Fair", "Good", "Strong"];
  const colors = ["#e24b4a", "#ef9f27", "#1db87a", "#1db87a"];
  return { score, label: labels[score - 1] || "Too weak", color: colors[score - 1] || "#e24b4a" };
}
const strengthClass = (barIndex, score) => { if (barIndex >= score) return "ca-sbar"; const cls = ["weak", "fair", "good", "strong"]; return `ca-sbar ${cls[score - 1]}`; };

function SignInForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [remembered, setRemembered] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    const { data: profile, error: profileError } = await supabase.from("profiles").select("role, status").eq("id", data.user.id).single();
    if (profileError || !profile) { setError("Account not found. Please contact support."); await supabase.auth.signOut(); return; }
    if (profile.role !== "customer") { setError("This portal is for customers only. Please use the correct login."); await supabase.auth.signOut(); return; }
    if (profile.status === "suspended") { setError("Your account has been suspended. Please contact support."); await supabase.auth.signOut(); return; }
    onSuccess();
  };

  return (
    <div>
      {error && <div className="ca-error-msg">{error}</div>}
      <div className="ca-field"><label className="ca-field-label">Email</label><div className="ca-input-wrap"><svg className="ca-input-icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" /></svg><input type="email" placeholder="you@restaurant.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} /></div></div>
      <div className="ca-field"><label className="ca-field-label">Password</label><div className="ca-input-wrap"><svg className="ca-input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg><input type={pwVisible ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} /><button className="ca-eye-btn" onClick={() => setPwVisible(v => !v)} aria-label="Toggle password visibility">{pwVisible ? <EyeOnIcon /> : <EyeOffIcon />}</button></div></div>
      <div className="ca-remember-row"><label className="ca-checkbox-label" onClick={() => setRemembered(v => !v)}><Checkbox checked={remembered} />Remember me</label><a href="#" className="ca-forgot-link">Forgot password?</a></div>
      <button className="ca-btn-submit" onClick={handleSubmit} disabled={loading}>{loading ? "Signing in…" : "Sign In"}{!loading && <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}</button>
    </div>
  );
}

function RegisterForm({ onSuccess }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [pw2Visible, setPw2Visible] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const strength = getStrength(pw);
  const matchMsg = () => { if (!pw2) return { text: "", cls: "ca-match-msg" }; if (pw === pw2) return { text: "✓ Passwords match", cls: "ca-match-msg ok" }; return { text: "✗ Passwords do not match", cls: "ca-match-msg err" }; };
  const match = matchMsg();

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!firstName || !lastName) { setError("Please enter your first and last name."); return; }
    if (!email) { setError("Please enter your email address."); return; }
    if (strength.score < 2) { setError("Please choose a stronger password."); return; }
    if (pw !== pw2) { setError("Passwords do not match."); return; }
    if (!termsChecked) { setError("Please agree to the Terms of Service."); return; }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password: pw, options: { data: { role: "customer", full_name: `${firstName} ${lastName}` } } });
    setLoading(false);
    if (signUpError) { setError(signUpError.message); return; }
    if (data.session) { onSuccess(); } else { setSuccess("Account created! Please check your email to confirm, then sign in."); }
  };

  return (
    <div>
      {error   && <div className="ca-error-msg">{error}</div>}
      {success && <div className="ca-success-msg">{success}</div>}
      <div className="ca-reg-grid">
        <div className="ca-field"><label className="ca-field-label">First Name</label><div className="ca-input-wrap"><svg className="ca-input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg><input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div></div>
        <div className="ca-field"><label className="ca-field-label">Last Name</label><div className="ca-input-wrap"><svg className="ca-input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg><input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div></div>
      </div>
      <div className="ca-field"><label className="ca-field-label">Email Address</label><div className="ca-input-wrap"><svg className="ca-input-icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" /></svg><input type="email" placeholder="you@restaurant.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
      <div className="ca-field"><label className="ca-field-label">Password</label><div className="ca-input-wrap"><svg className="ca-input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg><input type={pwVisible ? "text" : "password"} placeholder="Create a password" value={pw} onChange={e => setPw(e.target.value)} /><button className="ca-eye-btn" onClick={() => setPwVisible(v => !v)} aria-label="Toggle">{pwVisible ? <EyeOnIcon /> : <EyeOffIcon />}</button></div><div className="ca-pw-strength"><div className="ca-strength-bars">{[0, 1, 2, 3].map(i => (<div key={i} className={strengthClass(i, strength.score)} />))}</div><span className="ca-strength-label" style={{ color: pw ? strength.color : undefined }}>{strength.label}</span></div></div>
      <div className="ca-field"><label className="ca-field-label">Confirm Password</label><div className="ca-input-wrap"><svg className="ca-input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg><input type={pw2Visible ? "text" : "password"} placeholder="Repeat your password" value={pw2} onChange={e => setPw2(e.target.value)} /><button className="ca-eye-btn" onClick={() => setPw2Visible(v => !v)} aria-label="Toggle">{pw2Visible ? <EyeOnIcon /> : <EyeOffIcon />}</button></div><p className={match.cls}>{match.text}</p></div>
      <label className="ca-terms-label" onClick={() => setTermsChecked(v => !v)}><Checkbox checked={termsChecked} small />I agree to the{" "}<a href="#" className="ca-forgot-link" style={{ fontSize: 13 }}>Terms of Service</a>{" "}and{" "}<a href="#" className="ca-forgot-link" style={{ fontSize: 13 }}>Privacy Policy</a></label>
      <button className="ca-btn-submit" style={{ marginTop: "1rem" }} onClick={handleSubmit} disabled={loading}>{loading ? "Creating account…" : "Create Account"}{!loading && <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}</button>
    </div>
  );
}

export default function CustomerAuth() {
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignIn = activeTab === "signin";
  const handleSuccess = () => navigate("/customer/dashboard");

  // ── Smart back button ──────────────────────────────────────────────────────
  // ?from=web  → came from the static website  → hard redirect back to site
  // (no param) → came from the app RoleSelection → SPA navigate to '/'
  const handleBack = () => {
  if (searchParams.get('from') === 'web') {
    window.location.href = '/welcome';
  } else {
    navigate('/');
  }
};

  return (
    <>
      <style>{styles}</style>
      <div className="ca-layout">
        <div className="ca-hero">
          <div className="ca-arc3" />
          <div className="ca-brand">
            <img src={NavoqLogo} className="ca-brand-logo" alt="Navoq logo" />
            <div className="ca-brand-text"><span className="ca-brand-name">Navoq</span><br /><span className="ca-brand-tag">Customer Portal</span></div>
          </div>
          <div className="ca-hero-body">
            <h1 className="ca-hero-headline">Your tab,<br />always in check.</h1>
            <div className="ca-hero-divider" />
            <p className="ca-hero-sub">View your balance, track purchases, and settle your tab — all from one place.</p>
          </div>
          <div className="ca-features">
            <div className="ca-feature"><div className="ca-feature-icon-wrap"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg></div><span className="ca-feature-label">View Balance</span></div>
            <div className="ca-feature"><div className="ca-feature-icon-wrap"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg></div><span className="ca-feature-label">Track Orders</span></div>
            <div className="ca-feature"><div className="ca-feature-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div><span className="ca-feature-label">Secure &amp; Private</span></div>
          </div>
          <div className="ca-hero-footer">
            <span>© 2025 Navoq. All rights reserved.</span>
            <div className="ca-footer-links"><a href="#">Terms</a><span className="ca-footer-sep">|</span><a href="#">Privacy</a></div>
          </div>
        </div>

        <div className="ca-auth-panel">
          <button className="ca-back-btn" onClick={handleBack} aria-label="Go back">
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <div className="ca-card">
            <div className="ca-card-avatar"><img src={NavoqLogo} alt="Navoq" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: "50%" }} /></div>
            <h2 className="ca-card-title">{isSignIn ? "Welcome back 👋" : "Create an account"}</h2>
            <p className="ca-card-sub">{isSignIn ? "Sign in to your customer account" : "Register to start tracking your tab"}</p>
            <div className="ca-tabs" role="tablist">
              <button className={`ca-tab${isSignIn ? " active" : ""}`} role="tab" aria-selected={isSignIn} onClick={() => setActiveTab("signin")}>Sign In</button>
              <button className={`ca-tab${!isSignIn ? " active" : ""}`} role="tab" aria-selected={!isSignIn} onClick={() => setActiveTab("register")}>Register</button>
            </div>
            {isSignIn ? <SignInForm onSuccess={handleSuccess} /> : <RegisterForm onSuccess={handleSuccess} />}
          </div>
          <div className="ca-security-note">
            <div className="ca-security-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9,12 11,14 15,10" /></svg></div>
            <div className="ca-security-text"><p className="ca-security-title">Your data is protected</p><p className="ca-security-desc">We use industry-standard security<br />to keep your information safe.</p></div>
          </div>
        </div>
      </div>
    </>
  );
}