import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavoqLogo from "../../assets/NavoqLogo.png";
import { supabase } from "../../lib/supabase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --green-deep: #061a12; --green-accent: #1db87a; --white: #ffffff;
    --off-white: #f8f8f6; --border: #e8e8e4; --text-dark: #0f1f18;
    --text-mid: #4a5a52; --text-light: #8a9a92;
    --radius-md: 12px; --radius-xl: 20px;
  }
  html, body { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--off-white); }
  .rp-layout { display: flex; min-height: 100vh; }
  .rp-hero { width: 46%; background: var(--green-deep); position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 2.5rem 3rem; }
  .rp-hero::before { content: ''; position: absolute; top: -80px; right: -120px; width: 600px; height: 600px; border-radius: 50%; border: 1px solid rgba(29,184,122,0.12); pointer-events: none; }
  .rp-hero::after { content: ''; position: absolute; top: -40px; right: -180px; width: 700px; height: 700px; border-radius: 50%; border: 1px solid rgba(29,184,122,0.07); pointer-events: none; }
  .rp-brand { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .rp-brand-logo { width: 42px; height: 42px; flex-shrink: 0; }
  .rp-brand-name { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 600; color: var(--white); letter-spacing: -0.01em; }
  .rp-brand-tag { font-size: 12px; font-weight: 500; color: var(--green-accent); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 3px; }
  .rp-hero-body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 3rem 0; position: relative; z-index: 1; }
  .rp-hero-headline { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 500; color: var(--white); line-height: 1.15; margin-bottom: 1.25rem; }
  .rp-hero-divider { width: 36px; height: 3px; background: var(--green-accent); border-radius: 2px; margin-bottom: 1.25rem; }
  .rp-hero-sub { font-size: 15px; color: #7ab49a; line-height: 1.65; max-width: 320px; font-weight: 300; }
  .rp-panel { width: 54%; background: var(--off-white); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; position: relative; }
  .rp-card { background: var(--white); border-radius: var(--radius-xl); border: 0.5px solid var(--border); padding: 2.5rem 2.25rem 2rem; width: 100%; max-width: 420px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
  .rp-avatar { width: 60px; height: 60px; border-radius: 50%; background: #e6f5ed; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
  .rp-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 500; color: var(--text-dark); text-align: center; margin-bottom: 6px; }
  .rp-sub { font-size: 13.5px; color: var(--text-light); text-align: center; margin-bottom: 1.75rem; font-weight: 300; }
  .rp-field { margin-bottom: 1.1rem; }
  .rp-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-mid); margin-bottom: 7px; }
  .rp-input-wrap { position: relative; display: flex; align-items: center; }
  .rp-input-icon { position: absolute; left: 13px; width: 16px; height: 16px; stroke: #bbb; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
  .rp-input { width: 100%; height: 46px; padding: 0 42px; border: 1px solid var(--border); border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: var(--text-dark); background: var(--white); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .rp-input::placeholder { color: #c0c8c4; }
  .rp-input:focus { border-color: var(--green-accent); box-shadow: 0 0 0 3px rgba(29,184,122,0.1); }
  .rp-eye-btn { position: absolute; right: 13px; background: none; border: none; cursor: pointer; color: #bbb; display: flex; align-items: center; padding: 0; }
  .rp-eye-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .rp-strength { display: flex; align-items: center; gap: 8px; margin-top: 7px; }
  .rp-bars { display: flex; gap: 4px; }
  .rp-bar { width: 36px; height: 3px; border-radius: 2px; background: var(--border); transition: background 0.3s; }
  .rp-bar.weak { background: #e24b4a; } .rp-bar.fair { background: #ef9f27; } .rp-bar.good { background: #1db87a; } .rp-bar.strong { background: #0a2e25; }
  .rp-strength-label { font-size: 11px; color: var(--text-light); }
  .rp-match { font-size: 11.5px; margin-top: 5px; min-height: 16px; }
  .rp-match.ok { color: var(--green-accent); } .rp-match.err { color: #e24b4a; }
  .rp-btn { width: 100%; height: 50px; background: var(--green-deep); color: var(--white); border: none; border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 1.5rem; transition: background 0.2s, transform 0.15s; }
  .rp-btn:hover:not(:disabled) { background: #0d2e1e; }
  .rp-btn:active:not(:disabled) { transform: scale(0.99); }
  .rp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .rp-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .rp-error { background: #fff0f0; border: 1px solid #fcc; border-radius: var(--radius-md); padding: 10px 14px; font-size: 13px; color: #c0392b; margin-bottom: 1rem; text-align: center; }
  @media (max-width: 820px) { .rp-layout { flex-direction: column; } .rp-hero { display: none; } .rp-panel { width: 100%; min-height: 100vh; } }
`;

function getStrength(val) {
  if (!val) return { score: 0, label: "Enter a password" };
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const labels = ["Too weak", "Fair", "Good", "Strong"];
  const colors = ["#e24b4a", "#ef9f27", "#1db87a", "#1db87a"];
  return { score, label: labels[score - 1] || "Too weak", color: colors[score - 1] || "#e24b4a" };
}
const barClass = (i, score) => { if (i >= score) return "rp-bar"; return `rp-bar ${["weak","fair","good","strong"][score-1]}`; };

const EyeOff = () => (<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);
const EyeOn = () => (<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role = "owner" } = location.state || {};

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [pw2Visible, setPw2Visible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const strength = getStrength(pw);
  const matchMsg = !pw2 ? { text: "", cls: "rp-match" } : pw === pw2 ? { text: "✓ Passwords match", cls: "rp-match ok" } : { text: "✗ Passwords do not match", cls: "rp-match err" };

  const handleSubmit = async () => {
    if (strength.score < 2) { setError("Please choose a stronger password."); return; }
    if (pw !== pw2) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password: pw });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Sign out so user signs in fresh with new password
    await supabase.auth.signOut();
    const dest = role === "customer" ? "/customer/auth" : "/auth";
    navigate(dest, { state: { message: "Password updated! Please sign in with your new password." } });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="rp-layout">
        <div className="rp-hero">
          <div className="rp-brand">
            <img src={NavoqLogo} className="rp-brand-logo" alt="Navoq" />
            <div>
              <div className="rp-brand-name">Navoq</div>
              <div className="rp-brand-tag">{role === "customer" ? "Customer Portal" : "Restaurant/Shop Portal"}</div>
            </div>
          </div>
          <div className="rp-hero-body">
            <h1 className="rp-hero-headline">Almost<br />there.</h1>
            <div className="rp-hero-divider" />
            <p className="rp-hero-sub">Choose a strong new password to secure your account.</p>
          </div>
        </div>

        <div className="rp-panel">
          <div className="rp-card">
            <div className="rp-avatar">
              <img src={NavoqLogo} alt="Navoq" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: "50%" }} />
            </div>
            <h2 className="rp-title">New password 🔒</h2>
            <p className="rp-sub">Choose a strong password for your account.</p>

            {error && <div className="rp-error">{error}</div>}

            <div className="rp-field">
              <label className="rp-label">New Password</label>
              <div className="rp-input-wrap">
                <svg className="rp-input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <input className="rp-input" type={pwVisible ? "text" : "password"} placeholder="Create a password" value={pw} onChange={e => setPw(e.target.value)} />
                <button className="rp-eye-btn" onClick={() => setPwVisible(v => !v)}>{pwVisible ? <EyeOn /> : <EyeOff />}</button>
              </div>
              <div className="rp-strength">
                <div className="rp-bars">{[0,1,2,3].map(i => <div key={i} className={barClass(i, strength.score)} />)}</div>
                <span className="rp-strength-label" style={{ color: pw ? strength.color : undefined }}>{strength.label}</span>
              </div>
            </div>

            <div className="rp-field">
              <label className="rp-label">Confirm Password</label>
              <div className="rp-input-wrap">
                <svg className="rp-input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <input className="rp-input" type={pw2Visible ? "text" : "password"} placeholder="Repeat your password" value={pw2} onChange={e => setPw2(e.target.value)} />
                <button className="rp-eye-btn" onClick={() => setPw2Visible(v => !v)}>{pw2Visible ? <EyeOn /> : <EyeOff />}</button>
              </div>
              <p className={matchMsg.cls}>{matchMsg.text}</p>
            </div>

            <button className="rp-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Updating…" : "Set New Password"}
              {!loading && <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}