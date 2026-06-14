import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const JoinApp = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installPlatform, setInstallPlatform] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Detect platform
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setInstallPlatform('ios');
    else if (/android/i.test(ua)) setInstallPlatform('android');
    else setInstallPlatform('desktop');
  }, []);

  // Capture Android/Chrome install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Detect if already installed
  useEffect(() => {
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isInstalled) setInstalled(true);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') setInstalled(true);
      return;
    }
    setShowModal(true);
  };

  const handleOpenApp = () => {
    navigate('/customer/login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .join-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #080f0b;
          color: #eef2ee;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Background orbs */
        .join-orb1 {
          position: fixed; top: -120px; left: -80px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(29,184,122,0.18), transparent 70%);
          filter: blur(60px); pointer-events: none;
        }
        .join-orb2 {
          position: fixed; bottom: -100px; right: -80px;
          width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,107,69,0.15), transparent 70%);
          filter: blur(60px); pointer-events: none;
        }

        .join-card {
          position: relative; z-index: 2;
          background: #0f1f16;
          border: 1px solid rgba(29,184,122,0.15);
          border-radius: 28px;
          padding: 40px 32px 36px;
          width: 100%; max-width: 420px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
          text-align: center;
        }

        .join-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 700;
          color: #1db87a; margin-bottom: 4px;
          letter-spacing: 0.02em;
        }
        .join-logo-sub {
          font-size: 11px; color: #4d6b55;
          letter-spacing: 0.12em; font-weight: 600;
          margin-bottom: 32px;
        }

        .join-avatar {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #1db87a 0%, #0a5c35 100%);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 700; color: #fff;
          box-shadow: 0 8px 28px rgba(29,184,122,0.3);
        }

        .join-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 700;
          color: #fff; margin-bottom: 8px; line-height: 1.2;
        }
        .join-sub {
          font-size: 14px; color: #8fa98f;
          line-height: 1.6; margin-bottom: 32px;
        }

        .join-code-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(29,184,122,0.08);
          border: 1px solid rgba(29,184,122,0.2);
          border-radius: 50px; padding: 6px 16px;
          font-size: 13px; font-weight: 600; color: #1db87a;
          margin-bottom: 32px;
          letter-spacing: 0.05em;
        }
        .join-code-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #1db87a;
          animation: joinPulse 2s infinite;
        }
        @keyframes joinPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.7); }
        }

        .join-btn-primary {
          width: 100%; padding: 15px;
          background: #1db87a; color: #040d07;
          border: none; border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 700;
          cursor: pointer; margin-bottom: 12px;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 6px 24px rgba(29,184,122,0.3);
        }
        .join-btn-primary:hover { background: #22d98e; transform: translateY(-1px); }
        .join-btn-primary:active { transform: scale(0.98); }

        .join-btn-secondary {
          width: 100%; padding: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px; color: #8fa98f;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .join-btn-secondary:hover { border-color: rgba(29,184,122,0.3); color: #eef2ee; }

        .join-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 16px 0;
        }
        .join-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .join-divider-text { font-size: 11px; color: #4d6b55; font-weight: 600; }

        /* Platform hint */
        .join-platform-hint {
          margin-top: 24px;
          padding: 16px;
          background: rgba(29,184,122,0.06);
          border: 1px solid rgba(29,184,122,0.12);
          border-radius: 16px;
          text-align: left;
        }
        .join-platform-hint-title {
          font-size: 12px; font-weight: 700;
          color: #1db87a; margin-bottom: 10px;
          letter-spacing: 0.05em;
        }
        .join-steps { display: flex; flex-direction: column; gap: 10px; }
        .join-step { display: flex; align-items: flex-start; gap: 10px; }
        .join-step-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(29,184,122,0.15);
          border: 1px solid rgba(29,184,122,0.25);
          color: #1db87a; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .join-step-text { font-size: 13px; color: #c8dcc8; line-height: 1.5; }
        .join-step-text strong { color: #fff; }

        .join-installed-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(29,184,122,0.1);
          border: 1px solid rgba(29,184,122,0.2);
          border-radius: 50px; padding: 6px 14px;
          font-size: 12px; font-weight: 600; color: #1db87a;
          margin-bottom: 16px;
        }

        .join-footer {
          position: relative; z-index: 2;
          margin-top: 20px;
          font-size: 12px; color: #4d6b55;
          text-align: center;
        }
        .join-footer a { color: #1db87a; text-decoration: none; }

        /* MODAL */
        .join-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px);
          z-index: 200;
          display: flex; align-items: flex-end; justify-content: center;
          padding: 20px;
        }
        .join-modal {
          background: #0f1f16;
          border: 1px solid rgba(29,184,122,0.2);
          border-radius: 24px 24px 20px 20px;
          padding: 32px 28px 28px;
          width: 100%; max-width: 440px;
          position: relative;
        }
        .join-modal-close {
          position: absolute; top: 16px; right: 16px;
          background: rgba(255,255,255,0.08); border: none;
          color: #8fa98f; width: 32px; height: 32px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 18px; line-height: 1;
          transition: background 0.2s;
        }
        .join-modal-close:hover { background: rgba(255,255,255,0.14); }
        .join-modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 700; color: #fff; margin-bottom: 6px;
        }
        .join-modal-sub { font-size: 13px; color: #8fa98f; margin-bottom: 24px; }
        .join-modal-steps { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .join-modal-step { display: flex; align-items: flex-start; gap: 14px; }
        .join-modal-step-num {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(29,184,122,0.15);
          border: 1px solid rgba(29,184,122,0.3);
          color: #1db87a; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .join-modal-step-text { font-size: 14px; color: #c8dcc8; line-height: 1.5; }
        .join-modal-step-text strong { color: #fff; font-weight: 600; }
        .join-modal-icon-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(29,184,122,0.1);
          border: 1px solid rgba(29,184,122,0.2);
          border-radius: 8px; padding: 4px 10px;
          font-size: 12px; color: #1db87a; font-weight: 600;
          margin-top: 6px;
        }
        .join-modal-btn {
          width: 100%; padding: 13px;
          background: #1db87a; color: #040d07;
          border: none; border-radius: 50px;
          font-size: 14px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.2s;
        }
        .join-modal-btn:hover { background: #22d98e; }
      `}</style>

      {/* Install modal */}
      {showModal && (
        <div className="join-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="join-modal" onClick={e => e.stopPropagation()}>
            <button className="join-modal-close" onClick={() => setShowModal(false)}>×</button>
            <div className="join-modal-title">Install Navoq</div>

            {installPlatform === 'ios' ? (
              <>
                <div className="join-modal-sub">Open this page in Safari, then follow these steps.</div>
                <div className="join-modal-steps">
                  <div className="join-modal-step">
                    <div className="join-modal-step-num">1</div>
                    <div className="join-modal-step-text">
                      Tap the <strong>Share</strong> button at the bottom of Safari
                      <div style={{marginTop:6}}><span className="join-modal-icon-badge">⬆ Share</span></div>
                    </div>
                  </div>
                  <div className="join-modal-step">
                    <div className="join-modal-step-num">2</div>
                    <div className="join-modal-step-text">Scroll down and tap <strong>"Add to Home Screen"</strong></div>
                  </div>
                  <div className="join-modal-step">
                    <div className="join-modal-step-num">3</div>
                    <div className="join-modal-step-text">Tap <strong>Add</strong> in the top right — Navoq is now on your home screen!</div>
                  </div>
                </div>
              </>
            ) : installPlatform === 'android' ? (
              <>
                <div className="join-modal-sub">Open this page in Chrome, then follow these steps.</div>
                <div className="join-modal-steps">
                  <div className="join-modal-step">
                    <div className="join-modal-step-num">1</div>
                    <div className="join-modal-step-text">
                      Tap the <strong>3-dot menu</strong> in the top right of Chrome
                      <div style={{marginTop:6}}><span className="join-modal-icon-badge">⋮ Menu</span></div>
                    </div>
                  </div>
                  <div className="join-modal-step">
                    <div className="join-modal-step-num">2</div>
                    <div className="join-modal-step-text">Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></div>
                  </div>
                  <div className="join-modal-step">
                    <div className="join-modal-step-num">3</div>
                    <div className="join-modal-step-text">Tap <strong>Add</strong> to confirm — done!</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="join-modal-sub">Install Navoq directly from your browser — no app store needed.</div>
                <div className="join-modal-steps">
                  <div className="join-modal-step">
                    <div className="join-modal-step-num">1</div>
                    <div className="join-modal-step-text">Look for the <strong>install icon</strong> in your browser's address bar (right side)</div>
                  </div>
                  <div className="join-modal-step">
                    <div className="join-modal-step-num">2</div>
                    <div className="join-modal-step-text">Or open the <strong>browser menu</strong> and tap <strong>"Install Navoq"</strong></div>
                  </div>
                  <div className="join-modal-step">
                    <div className="join-modal-step-num">3</div>
                    <div className="join-modal-step-text">Click <strong>Install</strong> to confirm</div>
                  </div>
                </div>
              </>
            )}

            <button className="join-modal-btn" onClick={() => setShowModal(false)}>Got it</button>
          </div>
        </div>
      )}

      <div className="join-orb1" />
      <div className="join-orb2" />

      <div className="join-card">
        <div className="join-logo">Navoq</div>
        <div className="join-logo-sub">DIGITAL CREDIT MANAGEMENT</div>

        <div className="join-avatar">N</div>

        <h1 className="join-heading">You've been invited to Navoq</h1>
        <p className="join-sub">
          Track your restaurant tabs digitally. See your balance in real time, manage disputes, and never lose track of what you owe.
        </p>

        {code && (
          <div className="join-code-badge">
            <span className="join-code-dot" />
            Invite code: <strong>{code.toUpperCase()}</strong>
          </div>
        )}

        {installed ? (
          <>
            <div className="join-installed-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              App already installed
            </div>
            <button className="join-btn-primary" onClick={handleOpenApp}>
              Open Navoq
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </>
        ) : (
          <>
            <button className="join-btn-primary" onClick={handleInstall}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16l-4-4h3V4h2v8h3l-4 4z"/><path d="M20 20H4"/></svg>
              Install Navoq App
            </button>

            <div className="join-divider">
              <div className="join-divider-line" />
              <span className="join-divider-text">ALREADY HAVE IT?</span>
              <div className="join-divider-line" />
            </div>

            <button className="join-btn-secondary" onClick={handleOpenApp}>
              Open the app
            </button>

            {/* Platform-specific inline hint */}
            {installPlatform === 'ios' && (
              <div className="join-platform-hint">
                <div className="join-platform-hint-title">📱 iPhone / iPad</div>
                <div className="join-steps">
                  <div className="join-step">
                    <div className="join-step-num">1</div>
                    <div className="join-step-text">Tap <strong>Share ⬆</strong> at the bottom of Safari</div>
                  </div>
                  <div className="join-step">
                    <div className="join-step-num">2</div>
                    <div className="join-step-text">Tap <strong>"Add to Home Screen"</strong></div>
                  </div>
                  <div className="join-step">
                    <div className="join-step-num">3</div>
                    <div className="join-step-text">Tap <strong>Add</strong> — done!</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="join-footer">
        By installing you agree to our{' '}
        <a href="/legal/terms">Terms</a> &amp; <a href="/legal/privacy">Privacy Policy</a>
        <br />
        <span style={{marginTop:6,display:'block'}}>© 2026 Navoq · Nidaam Labs (Pty) Ltd</span>
      </div>
    </>
  );
};

export default JoinApp;