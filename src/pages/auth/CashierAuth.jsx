import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavoqLogo from '../../assets/NavoqLogo.png';
import { supabase } from '../../lib/supabase';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green-deep: #061a12;
    --green-dark: #0a2318;
    --green-mid: #0f3524;
    --green-accent: #1db87a;
    --green-light: #2dd881;
    --green-muted: #4a8c6a;
    --green-faint: #1a4a30;
    --white: #ffffff;
    --off-white: #f8f8f6;
    --border: #e8e8e4;
    --text-dark: #0f1f18;
    --text-mid: #4a5a52;
    --text-light: #8a9a92;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
  }

  html, body { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--off-white); }

  .layout { display: flex; min-height: 100vh; }

  .hero {
    width: 46%; background: var(--green-deep); position: relative;
    overflow: hidden; display: flex; flex-direction: column; padding: 2.5rem 3rem;
  }
  .hero::before {
    content: ''; position: absolute; top: -80px; right: -120px;
    width: 600px; height: 600px; border-radius: 50%;
    border: 1px solid rgba(29,184,122,0.12); pointer-events: none;
  }
  .hero::after {
    content: ''; position: absolute; top: -40px; right: -180px;
    width: 700px; height: 700px; border-radius: 50%;
    border: 1px solid rgba(29,184,122,0.07); pointer-events: none;
  }
  .arc3 {
    position: absolute; top: 20px; right: -230px;
    width: 800px; height: 800px; border-radius: 50%;
    border: 1px solid rgba(29,184,122,0.05); pointer-events: none;
  }

  .brand { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .brand-logo { width: 42px; height: 42px; flex-shrink: 0; }
  .brand-text { display: flex; flex-direction: column; line-height: 1; }
  .brand-name { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 600; color: var(--white); letter-spacing: -0.01em; }
  .brand-tag { font-size: 12px; font-weight: 500; color: var(--green-accent); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 3px; }

  .hero-body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 3rem 0; position: relative; z-index: 1; }
  .hero-headline { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 500; color: var(--white); line-height: 1.15; margin-bottom: 1.25rem; letter-spacing: -0.01em; }
  .hero-divider { width: 36px; height: 3px; background: var(--green-accent); border-radius: 2px; margin-bottom: 1.25rem; }
  .hero-sub { font-size: 15px; color: #7ab49a; line-height: 1.65; max-width: 320px; font-weight: 300; }

  .features { display: flex; gap: 0; margin-top: auto; padding-top: 2.5rem; position: relative; z-index: 1; }
  .feature { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 1rem 0.5rem; border-right: 0.5px solid rgba(255,255,255,0.08); }
  .feature:last-child { border-right: none; }
  .feature-icon-wrap { width: 44px; height: 44px; border-radius: 10px; background: rgba(29,184,122,0.12); display: flex; align-items: center; justify-content: center; }
  .feature-icon-wrap svg { width: 20px; height: 20px; stroke: var(--green-accent); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .feature-label { font-size: 12px; color: #7ab49a; font-weight: 400; text-align: center; }

  .hero-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #3a6a50; padding-top: 1.5rem; position: relative; z-index: 1; }
  .hero-footer a { color: #3a6a50; text-decoration: none; transition: color 0.2s; }
  .hero-footer a:hover { color: var(--green-accent); }
  .footer-links { display: flex; gap: 0; align-items: center; }
  .footer-sep { margin: 0 10px; opacity: 0.5; }

  .auth-panel { width: 54%; background: var(--off-white); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; position: relative; }

  .back-btn { position: absolute; top: 1.5rem; left: 1.5rem; width: 36px; height: 36px; border: 0.5px solid var(--border); border-radius: 9px; background: var(--white); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-mid); transition: border-color 0.2s, box-shadow 0.2s; }
  .back-btn:hover { border-color: #ccc; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .back-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

  .card { background: var(--white); border-radius: var(--radius-xl); border: 0.5px solid var(--border); padding: 2.5rem 2.25rem 2rem; width: 100%; max-width: 420px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); overflow-y: auto; max-height: 92vh; }

  .card-avatar { width: 60px; height: 60px; border-radius: 50%; background: #e6f5ed; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 500; color: var(--text-dark); text-align: center; margin-bottom: 6px; letter-spacing: -0.01em; }
  .card-sub { font-size: 13.5px; color: var(--text-light); text-align: center; margin-bottom: 1.75rem; font-weight: 300; }

  .tabs { display: flex; background: #f1f1ee; border-radius: var(--radius-md); padding: 4px; margin-bottom: 1.75rem; gap: 4px; }
  .tab { flex: 1; height: 38px; border: none; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--text-light); }
  .tab.active { background: var(--green-deep); color: var(--white); box-shadow: 0 1px 6px rgba(0,0,0,0.15); }
  .tab:not(.active):hover { color: var(--text-mid); }

  .field { margin-bottom: 1.1rem; }
  .field-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-mid); margin-bottom: 7px; }

  .input-wrap { position: relative; display: flex; align-items: center; }
  .input-icon { position: absolute; left: 13px; width: 16px; height: 16px; stroke: #bbb; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }

  .field input[type="email"],
  .field input[type="password"],
  .field input[type="text"],
  .field input[type="tel"] {
    width: 100%; height: 46px; padding: 0 42px; border: 1px solid var(--border);
    border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif;
    font-size: 13.5px; color: var(--text-dark); background: var(--white);
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .field input::placeholder { color: #c0c8c4; }
  .field input:focus { border-color: var(--green-accent); box-shadow: 0 0 0 3px rgba(29,184,122,0.1); }

  .eye-btn { position: absolute; right: 13px; background: none; border: none; cursor: pointer; color: #bbb; display: flex; align-items: center; padding: 0; transition: color 0.2s; }
  .eye-btn:hover { color: var(--text-mid); }
  .eye-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

  .remember-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
  .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--text-mid); user-select: none; }

  .custom-checkbox { width: 18px; height: 18px; border-radius: 5px; background: var(--green-deep); border: none; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s, border 0.2s; }
  .custom-checkbox svg { width: 11px; height: 11px; stroke: #fff; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
  .custom-checkbox.small { width: 16px; height: 16px; margin-top: 2px; }

  .forgot-link { font-size: 13px; font-weight: 500; color: var(--green-accent); text-decoration: none; transition: opacity 0.2s; }
  .forgot-link:hover { opacity: 0.75; }

  .btn-signin { width: 100%; height: 50px; background: var(--green-deep); color: var(--white); border: none; border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.15s; letter-spacing: 0.01em; }
  .btn-signin:hover { background: #0d2e1e; }
  .btn-signin:active { transform: scale(0.99); }
  .btn-signin:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-signin svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }

  .error-msg { background: #fff0f0; border: 1px solid #fcc; border-radius: var(--radius-md); padding: 10px 14px; font-size: 13px; color: #c0392b; margin-bottom: 1rem; }
  .success-msg { background: #f0faf5; border: 1px solid #b2dfce; border-radius: var(--radius-md); padding: 10px 14px; font-size: 13px; color: #0a6640; margin-bottom: 1rem; }

  .security-note { display: flex; align-items: flex-start; gap: 14px; margin-top: 1.75rem; max-width: 420px; width: 100%; }
  .security-icon { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d4e8dc; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .security-icon svg { width: 18px; height: 18px; stroke: var(--green-accent); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .security-text { padding-top: 2px; }
  .security-title { font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 2px; }
  .security-desc { font-size: 12px; color: var(--text-light); line-height: 1.5; }

  .reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .field-divider { display: flex; align-items: center; gap: 10px; margin: 0.75rem 0 0.5rem; }
  .field-divider::before, .field-divider::after { content: ''; flex: 1; height: 0.5px; background: var(--border); }
  .field-divider span { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-light); white-space: nowrap; }

  .pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 7px; }
  .strength-bars { display: flex; gap: 4px; }
  .sbar { width: 36px; height: 3px; border-radius: 2px; background: var(--border); transition: background 0.3s; }
  .sbar.weak { background: #e24b4a; }
  .sbar.fair { background: #ef9f27; }
  .sbar.good { background: #1db87a; }
  .sbar.strong { background: #0a2e25; }
  .strength-label { font-size: 11px; color: var(--text-light); }

  .match-msg { font-size: 11.5px; margin-top: 5px; min-height: 16px; }
  .match-msg.ok { color: var(--green-accent); }
  .match-msg.err { color: #e24b4a; }

  .terms-label { display: flex; align-items: flex-start; gap: 9px; font-size: 13px; color: var(--text-mid); cursor: pointer; margin-bottom: 0; line-height: 1.5; }

  @media (max-width: 820px) {
    .layout { flex-direction: column; }
    .hero { width: 100%; padding: 2rem; min-height: auto; }
    .auth-panel { width: 100%; min-height: auto; }
    .hero-headline { font-size: 32px; }
    .reg-grid { grid-template-columns: 1fr; }
  }

  .biz-toggle { display: flex; gap: 8px; margin-bottom: 1.1rem; }
  .biz-option { flex: 1; height: 44px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500; color: var(--text-mid); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
  .biz-option.selected { border-color: var(--green-accent); background: #f0faf5; color: var(--green-deep); }
  .biz-option svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
`;

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const EyeOnIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Checkbox = ({ checked, small }) => (
  <div
    className={`custom-checkbox${small ? " small" : ""}`}
    style={{
      background: checked ? "var(--green-deep)" : "transparent",
      border: checked ? "none" : "1.5px solid #ccc",
    }}
  >
    <svg viewBox="0 0 12 12" style={{ opacity: checked ? 1 : 0 }}>
      <polyline points="2,6 5,9 10,3" />
    </svg>
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

const strengthClass = (barIndex, score) => {
  if (barIndex >= score) return "sbar";
  const cls = ["weak", "fair", "good", "strong"];
  return `sbar ${cls[score - 1]}`;
};

// ── Sign In ──────────────────────────────────────────────────────────────────
function SignInForm({ onSuccess }) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [pwVisible, setPwVisible]   = useState(false);
  const [remembered, setRemembered] = useState(true);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    onSuccess();
  };

  return (
    <div>
      {error && <div className="error-msg">{error}</div>}

      <div className="field">
        <label className="field-label">Email</label>
        <div className="input-wrap">
          <svg className="input-icon" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m2 7 10 7 10-7" />
          </svg>
          <input type="email" placeholder="you@restaurant.com" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Password</label>
        <div className="input-wrap">
          <svg className="input-icon" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={pwVisible ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSignIn()}
          />
          <button className="eye-btn" onClick={() => setPwVisible(v => !v)} aria-label="Toggle password visibility">
            {pwVisible ? <EyeOnIcon /> : <EyeOffIcon />}
          </button>
        </div>
      </div>

      <div className="remember-row">
        <label className="checkbox-label" onClick={() => setRemembered(v => !v)}>
          <Checkbox checked={remembered} />
          Remember me
        </label>
        <a href="#" className="forgot-link">Forgot password?</a>
      </div>

      <button className="btn-signin" onClick={handleSignIn} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
        {!loading && <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
      </button>
    </div>
  );
}

// ── Register ─────────────────────────────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [regPw, setRegPw]               = useState('');
  const [regPw2, setRegPw2]             = useState('');
  const [regPwVisible, setRegPwVisible] = useState(false);
  const [regPw2Visible, setRegPw2Visible] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  const strength = getStrength(regPw);

  const matchMsg = () => {
    if (!regPw2) return { text: '', cls: 'match-msg' };
    if (regPw === regPw2) return { text: '✓ Passwords match', cls: 'match-msg ok' };
    return { text: '✗ Passwords do not match', cls: 'match-msg err' };
  };
  const match = matchMsg();

  const handleRegister = async () => {
    if (!firstName || !lastName || !businessName || !email || !regPw) {
      setError('Please fill in all fields.'); return;
    }
    if (regPw !== regPw2) { setError('Passwords do not match.'); return; }
    if (strength.score < 2) { setError('Please choose a stronger password.'); return; }
    if (!termsChecked) { setError('Please accept the Terms of Service.'); return; }

    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: regPw,
      options: {
        data: {
          role: 'owner',
          full_name: `${firstName} ${lastName}`,
          business_name: businessName,
          business_type: businessType,
          phone,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
        onSuccess();
      } else {
        setSuccess('Account created! You can now sign in.');
      }
      setLoading(false);
  };

  return (
    <div>
      {error   && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="reg-grid">
        <div className="field">
          <label className="field-label">First Name</label>
          <div className="input-wrap">
            <svg className="input-icon" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="field-label">Last Name</label>
          <div className="input-wrap">
            <svg className="input-icon" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Business Type</label>
        <div className="biz-toggle">
          <button type="button" className={`biz-option${businessType === 'restaurant' ? ' selected' : ''}`} onClick={() => setBusinessType('restaurant')}>
            <svg viewBox="0 0 24 24"><path d="M3 2l1.5 9H19.5L21 2z" /><path d="M3 11v1a9 9 0 0 0 18 0v-1" /></svg>
            Restaurant
          </button>
          <button type="button" className={`biz-option${businessType === 'shop' ? ' selected' : ''}`} onClick={() => setBusinessType('shop')}>
            <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
            Shop
          </button>
        </div>
      </div>

      <div className="field">
        <label className="field-label">{businessType === 'restaurant' ? 'Restaurant Name' : 'Shop Name'}</label>
        <div className="input-wrap">
          <svg className="input-icon" viewBox="0 0 24 24">
            <path d="M3 2l1.5 9H19.5L21 2z" /><path d="M3 11v1a9 9 0 0 0 18 0v-1" />
          </svg>
          <input type="text" placeholder={businessType === 'restaurant' ? 'The Grand Bistro' : 'My Shop'}
            value={businessName} onChange={e => setBusinessName(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Email Address</label>
        <div className="input-wrap">
          <svg className="input-icon" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
          </svg>
          <input type="email" placeholder="you@restaurant.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Phone Number</label>
        <div className="input-wrap">
          <svg className="input-icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.36 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <input type="tel" placeholder="+27 82 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="field-divider"><span>Security</span></div>

      <div className="field">
        <label className="field-label">Password</label>
        <div className="input-wrap">
          <svg className="input-icon" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input type={regPwVisible ? 'text' : 'password'} placeholder="Create a password"
            value={regPw} onChange={e => setRegPw(e.target.value)} />
          <button className="eye-btn" onClick={() => setRegPwVisible(v => !v)} aria-label="Toggle">
            {regPwVisible ? <EyeOnIcon /> : <EyeOffIcon />}
          </button>
        </div>
        <div className="pw-strength">
          <div className="strength-bars">
            {[0, 1, 2, 3].map(i => <div key={i} className={strengthClass(i, strength.score)} />)}
          </div>
          <span className="strength-label" style={{ color: regPw ? strength.color : undefined }}>{strength.label}</span>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Confirm Password</label>
        <div className="input-wrap">
          <svg className="input-icon" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input type={regPw2Visible ? 'text' : 'password'} placeholder="Repeat your password"
            value={regPw2} onChange={e => setRegPw2(e.target.value)} />
          <button className="eye-btn" onClick={() => setRegPw2Visible(v => !v)} aria-label="Toggle">
            {regPw2Visible ? <EyeOnIcon /> : <EyeOffIcon />}
          </button>
        </div>
        <p className={match.cls}>{match.text}</p>
      </div>

      <label className="terms-label" onClick={() => setTermsChecked(v => !v)}>
        <Checkbox checked={termsChecked} small />
        I agree to the{' '}
        <a href="#" className="forgot-link" style={{ fontSize: 13 }}>Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="forgot-link" style={{ fontSize: 13 }}>Privacy Policy</a>
      </label>

      <button className="btn-signin" style={{ marginTop: '1rem' }} onClick={handleRegister} disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
        {!loading && <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const navigate = useNavigate();
  const isSignIn = activeTab === 'signin';

  const handleSuccess = () => navigate('/dashboard');

  return (
    <>
      <style>{styles}</style>
      <div className="layout">
        <div className="hero">
          <div className="arc3" />
          <div className="brand">
            <img src={NavoqLogo} className="brand-logo" alt="Navoq logo" />
            <div className="brand-text">
              <span className="brand-name">Navoq</span><br />
              <span className="brand-tag">Restaurant/Shop Portal</span>
            </div>
          </div>

          <div className="hero-body">
            <h1 className="hero-headline">Manage your tabs<br />with confidence.</h1>
            <div className="hero-divider" />
            <p className="hero-sub">Track credit, manage debtors, and settle accounts — all in one place.</p>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
              </div>
              <span className="feature-label">Track Credit</span>
            </div>
            <div className="feature">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <span className="feature-label">Manage Debtors</span>
            </div>
            <div className="feature">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <span className="feature-label">Secure &amp; Reliable</span>
            </div>
          </div>

          <div className="hero-footer">
            <span>© 2025 Navoq. All rights reserved.</span>
            <div className="footer-links">
              <a href="#">Terms</a><span className="footer-sep">|</span><a href="#">Privacy</a>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>

          <div className="card">
            <div className="card-avatar">
              <img src={NavoqLogo} alt="Navoq" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: '50%' }} />
            </div>
            <h2 className="card-title">{isSignIn ? 'Welcome back 👋' : 'Create an account'}</h2>
            <p className="card-sub">{isSignIn ? 'Sign in to your restaurant account' : 'Register your restaurant to get started'}</p>

            <div className="tabs" role="tablist">
              <button className={`tab${isSignIn ? ' active' : ''}`} role="tab" onClick={() => setActiveTab('signin')}>Sign In</button>
              <button className={`tab${!isSignIn ? ' active' : ''}`} role="tab" onClick={() => setActiveTab('register')}>Register</button>
            </div>

            {isSignIn ? <SignInForm onSuccess={handleSuccess} /> : <RegisterForm onSuccess={handleSuccess} />}
          </div>

          <div className="security-note">
            <div className="security-icon">
              <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9,12 11,14 15,10" /></svg>
            </div>
            <div className="security-text">
              <p className="security-title">Your data is protected</p>
              <p className="security-desc">We use industry-standard security<br />to keep your information safe.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}