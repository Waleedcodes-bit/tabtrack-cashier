import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  .fp-layout { display: flex; min-height: 100vh; }
  .fp-hero { width: 46%; background: var(--green-deep); position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 2.5rem 3rem; }
  .fp-hero::before { content: ''; position: absolute; top: -80px; right: -120px; width: 600px; height: 600px; border-radius: 50%; border: 1px solid rgba(29,184,122,0.12); pointer-events: none; }
  .fp-hero::after { content: ''; position: absolute; top: -40px; right: -180px; width: 700px; height: 700px; border-radius: 50%; border: 1px solid rgba(29,184,122,0.07); pointer-events: none; }
  .fp-brand { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .fp-brand-logo { width: 42px; height: 42px; flex-shrink: 0; }
  .fp-brand-name { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 600; color: var(--white); letter-spacing: -0.01em; }
  .fp-brand-tag { font-size: 12px; font-weight: 500; color: var(--green-accent); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 3px; }
  .fp-hero-body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 3rem 0; position: relative; z-index: 1; }
  .fp-hero-headline { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 500; color: var(--white); line-height: 1.15; margin-bottom: 1.25rem; }
  .fp-hero-divider { width: 36px; height: 3px; background: var(--green-accent); border-radius: 2px; margin-bottom: 1.25rem; }
  .fp-hero-sub { font-size: 15px; color: #7ab49a; line-height: 1.65; max-width: 320px; font-weight: 300; }
  .fp-panel { width: 54%; background: var(--off-white); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; position: relative; }
  .fp-back-btn { position: absolute; top: 1.5rem; left: 1.5rem; width: 36px; height: 36px; border: 0.5px solid var(--border); border-radius: 9px; background: var(--white); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-mid); transition: border-color 0.2s, box-shadow 0.2s; }
  .fp-back-btn:hover { border-color: #ccc; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .fp-back-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .fp-card { background: var(--white); border-radius: var(--radius-xl); border: 0.5px solid var(--border); padding: 2.5rem 2.25rem 2rem; width: 100%; max-width: 420px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
  .fp-avatar { width: 60px; height: 60px; border-radius: 50%; background: #e6f5ed; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
  .fp-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 500; color: var(--text-dark); text-align: center; margin-bottom: 6px; }
  .fp-sub { font-size: 13.5px; color: var(--text-light); text-align: center; margin-bottom: 1.75rem; font-weight: 300; line-height: 1.5; }
  .fp-field { margin-bottom: 1.25rem; }
  .fp-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-mid); margin-bottom: 7px; }
  .fp-input-wrap { position: relative; display: flex; align-items: center; }
  .fp-input-icon { position: absolute; left: 13px; width: 16px; height: 16px; stroke: #bbb; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
  .fp-input { width: 100%; height: 46px; padding: 0 42px; border: 1px solid var(--border); border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: var(--text-dark); background: var(--white); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .fp-input::placeholder { color: #c0c8c4; }
  .fp-input:focus { border-color: var(--green-accent); box-shadow: 0 0 0 3px rgba(29,184,122,0.1); }
  .fp-btn { width: 100%; height: 50px; background: var(--green-deep); color: var(--white); border: none; border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.15s; }
  .fp-btn:hover:not(:disabled) { background: #0d2e1e; }
  .fp-btn:active:not(:disabled) { transform: scale(0.99); }
  .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .fp-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .fp-error { background: #fff0f0; border: 1px solid #fcc; border-radius: var(--radius-md); padding: 10px 14px; font-size: 13px; color: #c0392b; margin-bottom: 1rem; text-align: center; }
  .fp-back-link { text-align: center; margin-top: 1.25rem; font-size: 13px; color: var(--text-light); }
  .fp-back-link button { background: none; border: none; color: var(--green-accent); font-size: 13px; font-weight: 500; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  @media (max-width: 820px) { .fp-layout { flex-direction: column; } .fp-hero { display: none; } .fp-panel { width: 100%; min-height: 100vh; } }
`;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "owner";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true); setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    // Always navigate to OTP page (even if email not found — don't leak info)
    navigate("/verify-otp", { state: { email, type: "recovery", role } });
  };

  const backPath = role === "customer" ? "/customer/auth" : "/auth";

  return (
    <>
      <style>{styles}</style>
      <div className="fp-layout">
        <div className="fp-hero">
          <div className="fp-brand">
            <img src={NavoqLogo} className="fp-brand-logo" alt="Navoq" />
            <div>
              <div className="fp-brand-name">Navoq</div>
              <div className="fp-brand-tag">{role === "customer" ? "Customer Portal" : "Restaurant/Shop Portal"}</div>
            </div>
          </div>
          <div className="fp-hero-body">
            <h1 className="fp-hero-headline">Forgot your<br />password?</h1>
            <div className="fp-hero-divider" />
            <p className="fp-hero-sub">No worries. Enter your email and we'll send you a code to reset it.</p>
          </div>
        </div>

        <div className="fp-panel">
          <button className="fp-back-btn" onClick={() => navigate(backPath)} aria-label="Go back">
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <div className="fp-card">
            <div className="fp-avatar">
              <img src={NavoqLogo} alt="Navoq" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: "50%" }} />
            </div>
            <h2 className="fp-title">Reset password 🔑</h2>
            <p className="fp-sub">Enter your account email and we'll send you a 6-digit reset code.</p>

            {error && <div className="fp-error">{error}</div>}

            <div className="fp-field">
              <label className="fp-label">Email Address</label>
              <div className="fp-input-wrap">
                <svg className="fp-input-icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" /></svg>
                <input
                  className="fp-input"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>

            <button className="fp-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Sending…" : "Send Reset Code"}
              {!loading && <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
            </button>

            <div className="fp-back-link">
              Remember it?{" "}
              <button onClick={() => navigate(backPath)}>Back to sign in</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}