import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const REASONS = [
  { id: 'support',    label: 'Technical Support',  email: 'support@navoq.co.za' },
  { id: 'sales',      label: 'Sales & Pricing',    email: 'hello@navoq.co.za' },
  { id: 'privacy',    label: 'Privacy / Data',     email: 'privacy@nidaamlab.co.za' },
  { id: 'legal',      label: 'Legal',              email: 'legal@nidaamlab.co.za' },
  { id: 'other',      label: 'Other',              email: 'hello@navoq.co.za' },
];

const WebContact = () => {
  const navigate = useNavigate();
  const [reason, setReason]   = useState('support');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent]       = useState(false);

  const selected = REASONS.find(r => r.id === reason);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Navoq] ${selected.label} — ${name}`);
    const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${selected.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .wc-root { font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.65; background: #080f0b; color: #eef2ee; min-height: 100vh; overflow-x: hidden; }

        .wc-nav { position: sticky; top: 0; z-index: 100; background: rgba(8,15,11,0.9); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(29,184,122,0.12); }
        .wc-nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; }
        .wc-back { background: none; border: none; color: #8fa98f; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 0; transition: color 0.2s; }
        .wc-back:hover { color: #eef2ee; }
        .wc-logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #fff; margin-left: auto; letter-spacing: 0.02em; cursor: pointer; }

        .wc-body { max-width: 1100px; margin: 0 auto; padding: 64px 24px 80px; display: grid; grid-template-columns: 1fr 1.2fr; gap: 64px; align-items: start; }
        @media (max-width: 768px) { .wc-body { grid-template-columns: 1fr; gap: 40px; } }

        .wc-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #1db87a; margin-bottom: 14px; }
        .wc-headline { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 5vw, 56px); font-weight: 700; color: #fff; line-height: 1.1; margin-bottom: 20px; }
        .wc-sub { font-size: 15px; color: #6b8f72; line-height: 1.8; margin-bottom: 40px; }
        .wc-contact-row { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
        .wc-contact-icon { width: 36px; height: 36px; background: rgba(29,184,122,0.1); border: 1px solid rgba(29,184,122,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; margin-top: 2px; }
        .wc-contact-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #4d6b55; margin-bottom: 2px; }
        .wc-contact-val { font-size: 14px; color: #8fa98f; }
        .wc-contact-val a { color: #8fa98f; text-decoration: none; transition: color 0.2s; }
        .wc-contact-val a:hover { color: #1db87a; }

        .wc-form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; }
        .wc-form-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 24px; }
        .wc-field { margin-bottom: 18px; }
        .wc-label { display: block; font-size: 12px; font-weight: 600; color: #4d6b55; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
        .wc-input, .wc-select, .wc-textarea {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 11px 14px; font-size: 14px; color: #eef2ee;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; outline: none; box-sizing: border-box;
        }
        .wc-input:focus, .wc-select:focus, .wc-textarea:focus { border-color: rgba(29,184,122,0.4); }
        .wc-input::placeholder, .wc-textarea::placeholder { color: #2e4d38; }
        .wc-select { appearance: none; cursor: pointer; }
        .wc-select option { background: #0d1a10; color: #eef2ee; }
        .wc-textarea { resize: vertical; min-height: 110px; line-height: 1.6; }
        .wc-submit { width: 100%; padding: 13px; background: #1db87a; color: #040d07; border: none; border-radius: 50px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s; margin-top: 8px; }
        .wc-submit:hover { background: #22d98e; }
        .wc-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .wc-hint { font-size: 12px; color: #2e4d38; margin-top: 10px; text-align: center; }

        .wc-sent { text-align: center; padding: 40px 0; }
        .wc-sent-icon { font-size: 40px; margin-bottom: 16px; }
        .wc-sent-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .wc-sent-body { font-size: 14px; color: #6b8f72; line-height: 1.7; }

        .wc-footer { max-width: 1100px; margin: 0 auto; padding: 32px 24px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .wc-footer-copy { font-size: 12px; color: #2e4d38; }
      `}</style>

      <div className="wc-root">

        {/* Nav */}
        <nav className="wc-nav">
          <div className="wc-nav-inner">
            <button className="wc-back" onClick={() => navigate(-1)}>← Back</button>
            <span className="wc-logo" onClick={() => navigate('/welcome')}>Navoq</span>
          </div>
        </nav>

        {/* Body */}
        <div className="wc-body">

          {/* Left — info */}
          <div>
            <p className="wc-eyebrow">Get in Touch</p>
            <h1 className="wc-headline">We're here to help</h1>
            <p className="wc-sub">
              Whether you have a question about pricing, need technical help, or just want to say hello — reach out and we'll get back to you.
            </p>
            <div className="wc-contact-row">
              <div className="wc-contact-icon">🛠️</div>
              <div>
                <div className="wc-contact-label">Support</div>
                <div className="wc-contact-val"><a href="mailto:support@navoq.co.za">support@navoq.co.za</a></div>
              </div>
            </div>
            <div className="wc-contact-row">
              <div className="wc-contact-icon">🔒</div>
              <div>
                <div className="wc-contact-label">Privacy</div>
                <div className="wc-contact-val"><a href="mailto:privacy@nidaamlab.co.za">privacy@nidaamlab.co.za</a></div>
              </div>
            </div>
            <div className="wc-contact-row">
              <div className="wc-contact-icon">📋</div>
              <div>
                <div className="wc-contact-label">Legal</div>
                <div className="wc-contact-val"><a href="mailto:legal@nidaamlab.co.za">legal@nidaamlab.co.za</a></div>
              </div>
            </div>
            <div className="wc-contact-row">
              <div className="wc-contact-icon">📍</div>
              <div>
                <div className="wc-contact-label">Location</div>
                <div className="wc-contact-val">South Africa 🇿🇦</div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="wc-form-card">
            {sent ? (
              <div className="wc-sent">
                <div className="wc-sent-icon">✅</div>
                <div className="wc-sent-title">Message opened</div>
                <p className="wc-sent-body">
                  Your email client should have opened with your message pre-filled.<br />
                  We aim to respond within one business day.
                </p>
              </div>
            ) : (
              <>
                <div className="wc-form-title">Send us a message</div>
                <form onSubmit={handleSubmit}>
                  <div className="wc-field">
                    <label className="wc-label">Reason</label>
                    <select className="wc-select" value={reason} onChange={e => setReason(e.target.value)}>
                      {REASONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="wc-field">
                    <label className="wc-label">Your Name</label>
                    <input
                      className="wc-input" type="text" placeholder="Jane Smith"
                      value={name} onChange={e => setName(e.target.value)} required
                    />
                  </div>
                  <div className="wc-field">
                    <label className="wc-label">Your Email</label>
                    <input
                      className="wc-input" type="email" placeholder="jane@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} required
                    />
                  </div>
                  <div className="wc-field">
                    <label className="wc-label">Message</label>
                    <textarea
                      className="wc-textarea" placeholder="How can we help?"
                      value={message} onChange={e => setMessage(e.target.value)} required
                    />
                  </div>
                  <button className="wc-submit" type="submit" disabled={!name || !email || !message}>
                    Send Message
                  </button>
                  <p className="wc-hint">Opens your email client — no data sent to our servers.</p>
                </form>
              </>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="wc-footer">
          <span className="wc-footer-copy">© 2026 Navoq. A product of Nidaam Labs (Pty) Ltd. All rights reserved.</span>
          <span className="wc-footer-copy">Built in South Africa 🇿🇦</span>
        </div>

      </div>
    </>
  );
};

export default WebContact;