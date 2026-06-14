import React from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide when registering, including your business name, email address, and phone number. We also collect usage data such as transactions, orders, and payment records entered into the platform.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to provide and improve the Navoq service, to communicate with you about your account, and to ensure the security and integrity of the platform.',
  },
  {
    title: '3. Data Sharing',
    body: 'We do not sell or rent your personal information to third parties. Data may be shared with service providers who assist us in operating the platform, subject to confidentiality agreements.',
  },
  {
    title: '4. Data Storage and Security',
    body: 'Your data is stored securely. We implement industry-standard measures to protect against unauthorised access, alteration, or destruction of your information.',
  },
  {
    title: '5. Customer Data',
    body: 'Businesses using Navoq are responsible for obtaining appropriate consent from their customers before adding them to the platform as debtors.',
  },
  {
    title: '6. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@nidaamlab.co.za.',
  },
  {
    title: '7. Cookies',
    body: 'Navoq may use local storage and session data to maintain your login state and preferences. No third-party advertising cookies are used.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. We will notify users of significant changes via the app or email.',
  },
  {
    title: '9. Contact Us',
    body: 'For privacy-related queries, contact Nidaam Lab (Pty) Ltd at privacy@nidaamlab.co.za.',
  },
];

const WebPrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .wl-legal-root { font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.65; background: #080f0b; color: #eef2ee; min-height: 100vh; overflow-x: hidden; }
        .wl-legal-nav { position: sticky; top: 0; z-index: 100; background: rgba(8,15,11,0.9); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(29,184,122,0.12); }
        .wl-legal-nav-inner { max-width: 760px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; gap: 16px; }
        .wl-legal-back { background: none; border: none; color: #8fa98f; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 0; transition: color 0.2s; }
        .wl-legal-back:hover { color: #eef2ee; }
        .wl-legal-logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #fff; margin-left: auto; letter-spacing: 0.02em; cursor: pointer; }
        .wl-legal-body { max-width: 760px; margin: 0 auto; padding: 56px 24px 80px; }
        .wl-legal-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #1db87a; margin-bottom: 12px; }
        .wl-legal-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 6vw, 56px); font-weight: 700; color: #fff; line-height: 1.1; margin-bottom: 16px; }
        .wl-legal-meta { font-size: 13px; color: #4d6b55; margin-bottom: 48px; padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .wl-legal-intro { font-size: 16px; color: #8fa98f; line-height: 1.75; margin-bottom: 48px; }
        .wl-legal-section { margin-bottom: 36px; }
        .wl-legal-section-title { font-size: 15px; font-weight: 600; color: #eef2ee; margin-bottom: 10px; }
        .wl-legal-section-body { font-size: 14px; color: #6b8f72; line-height: 1.8; }
        .wl-legal-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 40px 0; }
        .wl-legal-footer { text-align: center; font-size: 12px; color: #2e4d38; padding-top: 16px; }
        .wl-legal-back-arrow { font-size: 18px; line-height: 1; }
      `}</style>

      <div className="wl-legal-root">
        {/* Nav */}
        <nav className="wl-legal-nav">
          <div className="wl-legal-nav-inner">
            <button className="wl-legal-back" onClick={() => navigate(-1)}>
              <span className="wl-legal-back-arrow">←</span>
              Back
            </button>
            <span className="wl-legal-logo" onClick={() => navigate('/welcome')}>Navoq</span>
          </div>
        </nav>

        {/* Content */}
        <div className="wl-legal-body">
          <p className="wl-legal-eyebrow">Legal</p>
          <h1 className="wl-legal-title">Privacy Policy</h1>
          <p className="wl-legal-meta">Last updated: May 2026</p>

          <p className="wl-legal-intro">
            This Privacy Policy explains how Nidaam Lab (Pty) Ltd collects, uses, and protects
            your information when you use Navoq.
          </p>

          {SECTIONS.map(({ title, body }) => (
            <div className="wl-legal-section" key={title}>
              <h2 className="wl-legal-section-title">{title}</h2>
              <p className="wl-legal-section-body">{body}</p>
            </div>
          ))}

          <hr className="wl-legal-divider" />
          <p className="wl-legal-footer">Nidaam Lab (Pty) Ltd — Navoq v1.0 · Built in South Africa 🇿🇦</p>
        </div>
      </div>
    </>
  );
};

export default WebPrivacyPolicy;