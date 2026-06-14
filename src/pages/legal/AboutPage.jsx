import React from 'react';
import { useNavigate } from 'react-router-dom';

const WebAbout = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .wa-root { font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.65; background: #080f0b; color: #eef2ee; min-height: 100vh; overflow-x: hidden; }

        /* NAV */
        .wa-nav { position: sticky; top: 0; z-index: 100; background: rgba(8,15,11,0.9); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(29,184,122,0.12); }
        .wa-nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; }
        .wa-back { background: none; border: none; color: #8fa98f; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 0; transition: color 0.2s; }
        .wa-back:hover { color: #eef2ee; }
        .wa-logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #fff; margin-left: auto; letter-spacing: 0.02em; cursor: pointer; }

        /* HERO */
        .wa-hero { padding: 80px 24px 64px; max-width: 1100px; margin: 0 auto; }
        .wa-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #1db87a; margin-bottom: 14px; }
        .wa-headline { font-family: 'Cormorant Garamond', serif; font-size: clamp(40px, 7vw, 72px); font-weight: 700; color: #fff; line-height: 1.08; margin-bottom: 24px; }
        .wa-headline em { font-style: italic; color: #1db87a; }
        .wa-sub { font-size: 17px; color: #8fa98f; max-width: 560px; line-height: 1.75; }

        /* DIVIDER */
        .wa-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 0; }

        /* MISSION */
        .wa-section { max-width: 1100px; margin: 0 auto; padding: 64px 24px; }
        .wa-section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: #1db87a; margin-bottom: 12px; }
        .wa-section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 44px); font-weight: 600; color: #fff; line-height: 1.2; margin-bottom: 20px; }
        .wa-section-body { font-size: 15px; color: #6b8f72; line-height: 1.85; max-width: 620px; }

        /* TWO-COL */
        .wa-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        @media (max-width: 640px) { .wa-two-col { grid-template-columns: 1fr; gap: 32px; } }

        /* VALUES */
        .wa-values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
        @media (max-width: 768px) { .wa-values { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .wa-values { grid-template-columns: 1fr; } }
        .wa-value-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; }
        .wa-value-icon { width: 40px; height: 40px; background: rgba(29,184,122,0.1); border: 1px solid rgba(29,184,122,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 18px; }
        .wa-value-title { font-size: 14px; font-weight: 600; color: #eef2ee; margin-bottom: 8px; }
        .wa-value-body { font-size: 13px; color: #4d6b55; line-height: 1.7; }

        /* TEAM */
        .wa-team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
        @media (max-width: 768px) { .wa-team-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .wa-team-grid { grid-template-columns: 1fr; } }
        .wa-team-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; }
        .wa-team-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, rgba(29,184,122,0.3), rgba(29,184,122,0.1)); border: 1px solid rgba(29,184,122,0.25); display: flex; align-items: center; justify-content: center; font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700; color: #1db87a; margin-bottom: 14px; }
        .wa-team-name { font-size: 14px; font-weight: 600; color: #eef2ee; margin-bottom: 4px; }
        .wa-team-role { font-size: 12px; color: #1db87a; margin-bottom: 10px; }
        .wa-team-bio { font-size: 13px; color: #4d6b55; line-height: 1.7; }

        /* CTA STRIP */
        .wa-cta-strip { background: rgba(29,184,122,0.05); border-top: 1px solid rgba(29,184,122,0.1); border-bottom: 1px solid rgba(29,184,122,0.1); }
        .wa-cta-inner { max-width: 1100px; margin: 0 auto; padding: 56px 24px; display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
        .wa-cta-text h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 40px); font-weight: 700; color: #fff; margin-bottom: 8px; }
        .wa-cta-text p { font-size: 15px; color: #8fa98f; }
        .wa-cta-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .wa-btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #1db87a; color: #040d07; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 50px; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .wa-btn-primary:hover { background: #22d98e; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(29,184,122,0.35); }
        .wa-btn-outline { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(29,184,122,0.25); color: #eef2ee; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px; padding: 12px 24px; border-radius: 50px; background: none; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .wa-btn-outline:hover { border-color: #1db87a; color: #1db87a; }

        /* FOOTER */
        .wa-footer { max-width: 1100px; margin: 0 auto; padding: 32px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .wa-footer-copy { font-size: 12px; color: #2e4d38; }
      `}</style>

      <div className="wa-root">

        {/* Nav */}
        <nav className="wa-nav">
          <div className="wa-nav-inner">
            <button className="wa-back" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <span className="wa-logo" onClick={() => navigate('/welcome')}>Navoq</span>
          </div>
        </nav>

        {/* Hero */}
        <div className="wa-hero">
          <p className="wa-eyebrow">About Us</p>
          <h1 className="wa-headline">Built to fix a <em>real</em><br />South African problem</h1>
          <p className="wa-sub">
            Navoq was born from watching small businesses lose money and relationships to informal credit — paper books, memory, and awkward conversations. We built the platform we wished existed.
          </p>
        </div>

        <hr className="wa-divider" />

        {/* Mission */}
        <div className="wa-section">
          <div className="wa-two-col">
            <div>
              <p className="wa-section-label">Our Mission</p>
              <h2 className="wa-section-title">Turning trust into a system</h2>
              <p className="wa-section-body">
                Informal credit — the spaza tab, the restaurant slate — is how communities operate. But it's fragile. Disputes happen. Relationships break. Money is lost.
              </p>
              <br />
              <p className="wa-section-body">
                Navoq gives businesses a simple, digital way to manage customer credit, and gives customers full visibility into what they owe. Both sides stay informed. Trust is preserved.
              </p>
            </div>
            <div>
              <p className="wa-section-label">The Company</p>
              <h2 className="wa-section-title">Nidaam Lab (Pty) Ltd</h2>
              <p className="wa-section-body">
                We're a South African software studio focused on practical tools for real businesses. Navoq is our flagship product, designed from the ground up for the local market — its rhythms, its relationships, its needs.
              </p>
              <br />
              <p className="wa-section-body">
                We build lean, reliable software that works on the devices people actually have, in the conditions they actually face.
              </p>
            </div>
          </div>
        </div>

        <hr className="wa-divider" />

        {/* Values */}
        <div className="wa-section">
          <p className="wa-section-label">What We Stand For</p>
          <h2 className="wa-section-title">Our values</h2>
          <div className="wa-values">
            {[
              { icon: '🤝', title: 'Trust First', body: 'Every feature is designed to preserve the relationship between a business and its customers.' },
              { icon: '⚡', title: 'Simplicity', body: 'If a cashier can\'t use it in 30 seconds, we rethink it. Complexity is a bug, not a feature.' },
              { icon: '🇿🇦', title: 'Built Local', body: 'We understand the South African market because we\'re part of it. No copy-paste from Silicon Valley.' },
              { icon: '🔒', title: 'Privacy', body: 'Customer data belongs to the business and the customer. We are stewards, not owners.' },
              { icon: '📱', title: 'Mobile First', body: 'Works offline. Works on low-end devices. Works with slow connections. No excuses.' },
              { icon: '💬', title: 'Transparency', body: 'Both sides of every transaction can see exactly what\'s owed and why. No surprises.' },
            ].map(({ icon, title, body }) => (
              <div className="wa-value-card" key={title}>
                <div className="wa-value-icon">{icon}</div>
                <div className="wa-value-title">{title}</div>
                <div className="wa-value-body">{body}</div>
              </div>
            ))}
          </div>
        </div>

        <hr className="wa-divider" />

        {/* CTA */}
        <div className="wa-cta-strip">
          <div className="wa-cta-inner">
            <div className="wa-cta-text">
              <h2>Ready to get started?</h2>
              <p>Join businesses already using Navoq to manage their customer credit.</p>
            </div>
            <div className="wa-cta-actions">
              <button className="wa-btn-primary" onClick={() => navigate('/cashier/register')}>Create Account</button>
              <button className="wa-btn-outline" onClick={() => navigate('/legal/contact')}>Get in Touch</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="wa-footer">
          <span className="wa-footer-copy">© 2026 Navoq. A product of Nidaam Labs (Pty) Ltd. All rights reserved.</span>
          <span className="wa-footer-copy">Built in South Africa 🇿🇦</span>
        </div>

      </div>
    </>
  );
};

export default WebAbout;