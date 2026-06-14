import { useState, useRef, useEffect } from "react";
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
  .otp-layout { display: flex; min-height: 100vh; }
  .otp-hero { width: 46%; background: var(--green-deep); position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 2.5rem 3rem; }
  .otp-hero::before { content: ''; position: absolute; top: -80px; right: -120px; width: 600px; height: 600px; border-radius: 50%; border: 1px solid rgba(29,184,122,0.12); pointer-events: none; }
  .otp-hero::after { content: ''; position: absolute; top: -40px; right: -180px; width: 700px; height: 700px; border-radius: 50%; border: 1px solid rgba(29,184,122,0.07); pointer-events: none; }
  .otp-brand { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .otp-brand-logo { width: 42px; height: 42px; flex-shrink: 0; }
  .otp-brand-name { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 600; color: var(--white); letter-spacing: -0.01em; }
  .otp-brand-tag { font-size: 12px; font-weight: 500; color: var(--green-accent); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 3px; }
  .otp-hero-body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 3rem 0; position: relative; z-index: 1; }
  .otp-hero-headline { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 500; color: var(--white); line-height: 1.15; margin-bottom: 1.25rem; }
  .otp-hero-divider { width: 36px; height: 3px; background: var(--green-accent); border-radius: 2px; margin-bottom: 1.25rem; }
  .otp-hero-sub { font-size: 15px; color: #7ab49a; line-height: 1.65; max-width: 320px; font-weight: 300; }
  .otp-panel { width: 54%; background: var(--off-white); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; position: relative; }
  .otp-back-btn { position: absolute; top: 1.5rem; left: 1.5rem; width: 36px; height: 36px; border: 0.5px solid var(--border); border-radius: 9px; background: var(--white); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-mid); transition: border-color 0.2s, box-shadow 0.2s; }
  .otp-back-btn:hover { border-color: #ccc; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .otp-back-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .otp-card { background: var(--white); border-radius: var(--radius-xl); border: 0.5px solid var(--border); padding: 2.5rem 2.25rem 2rem; width: 100%; max-width: 420px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
  .otp-avatar { width: 60px; height: 60px; border-radius: 50%; background: #e6f5ed; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
  .otp-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 500; color: var(--text-dark); text-align: center; margin-bottom: 6px; }
  .otp-sub { font-size: 13.5px; color: var(--text-light); text-align: center; margin-bottom: 2rem; font-weight: 300; line-height: 1.5; }
  .otp-sub strong { color: var(--text-mid); font-weight: 500; }
  .otp-inputs { display: flex; gap: 10px; justify-content: center; margin-bottom: 1.75rem; }
  .otp-input { width: 52px; height: 60px; border: 1.5px solid var(--border); border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif; font-size: 24px; font-weight: 600; color: var(--text-dark); text-align: center; outline: none; background: var(--white); transition: border-color 0.2s, box-shadow 0.2s; }
  .otp-input:focus { border-color: var(--green-accent); box-shadow: 0 0 0 3px rgba(29,184,122,0.1); }
  .otp-input.filled { border-color: var(--green-accent); background: #f0faf5; }
  .otp-btn { width: 100%; height: 50px; background: var(--green-deep); color: var(--white); border: none; border-radius: var(--radius-md); font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.15s; }
  .otp-btn:hover:not(:disabled) { background: #0d2e1e; }
  .otp-btn:active:not(:disabled) { transform: scale(0.99); }
  .otp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .otp-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .otp-error { background: #fff0f0; border: 1px solid #fcc; border-radius: var(--radius-md); padding: 10px 14px; font-size: 13px; color: #c0392b; margin-bottom: 1rem; text-align: center; }
  .otp-resend { text-align: center; margin-top: 1.25rem; font-size: 13px; color: var(--text-light); }
  .otp-resend button { background: none; border: none; color: var(--green-accent); font-size: 13px; font-weight: 500; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .otp-resend button:disabled { color: var(--text-light); cursor: not-allowed; }
  .otp-timer { color: var(--text-light); }
  @media (max-width: 820px) { .otp-layout { flex-direction: column; } .otp-hero { display: none; } .otp-panel { width: 100%; min-height: 100vh; } }
`;

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  // Expect: { email, type: 'signup'|'recovery', role: 'owner'|'customer', redirectTo }
  const { email, type = "signup", role = "owner", redirectTo } = location.state || {};

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate(role === "customer" ? "/customer/auth" : "/auth");
    }
  }, [email, navigate, role]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index, value) => {
    // Allow paste of full OTP
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || "";
      setDigits(newDigits);
      const nextEmpty = newDigits.findIndex(d => !d);
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = digits.join("");
    if (token.length < 6) { setError("Please enter the full 6-digit code."); return; }
    setLoading(true); setError("");

    const otpType = type === "recovery" ? "recovery" : "signup";
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: otpType });

    if (verifyError) {
      setError(verifyError.message || "Invalid or expired code. Please try again.");
      setLoading(false);
      return;
    }

    if (type === "recovery") {
      // Go to reset password page
      navigate("/reset-password", { state: { email, role } });
    } else {
      // Signup confirmed — go to dashboard
      const dest = redirectTo || (role === "customer" ? "/customer/dashboard" : "/dashboard");
      navigate(dest);
    }
  };

  const handleResend = async () => {
    setCanResend(false); setCountdown(60); setError("");
    if (type === "recovery") {
      await supabase.auth.resetPasswordForEmail(email);
    } else {
      await supabase.auth.resend({ type: "signup", email });
    }
  };

  const isSignup = type === "signup";

  return (
    <>
      <style>{styles}</style>
      <div className="otp-layout">
        <div className="otp-hero">
          <div className="otp-brand">
            <img src={NavoqLogo} className="otp-brand-logo" alt="Navoq" />
            <div>
              <div className="otp-brand-name">Navoq</div>
              <div className="otp-brand-tag">{role === "customer" ? "Customer Portal" : "Restaurant/Shop Portal"}</div>
            </div>
          </div>
          <div className="otp-hero-body">
            <h1 className="otp-hero-headline">One step<br />to go.</h1>
            <div className="otp-hero-divider" />
            <p className="otp-hero-sub">
              {isSignup
                ? "We sent a 6-digit code to your email. Enter it to activate your account."
                : "Enter the code we sent to verify your identity before resetting your password."}
            </p>
          </div>
        </div>

        <div className="otp-panel">
          <button className="otp-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <div className="otp-card">
            <div className="otp-avatar">
              <img src={NavoqLogo} alt="Navoq" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: "50%" }} />
            </div>
            <h2 className="otp-title">{isSignup ? "Verify your email ✉️" : "Check your email 🔐"}</h2>
            <p className="otp-sub">
              We sent a 6-digit code to<br /><strong>{email}</strong>
            </p>

            {error && <div className="otp-error">{error}</div>}

            <div className="otp-inputs">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  className={`otp-input${d ? " filled" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                />
              ))}
            </div>

            <button className="otp-btn" onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying…" : isSignup ? "Confirm Account" : "Verify Code"}
              {!loading && <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
            </button>

            <div className="otp-resend">
              Didn't receive it?{" "}
              {canResend
                ? <button onClick={handleResend}>Resend code</button>
                : <span className="otp-timer">Resend in {countdown}s</span>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}