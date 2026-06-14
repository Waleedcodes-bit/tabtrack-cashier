import React from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using Navoq, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application.',
  },
  {
    title: '2. Description of Service',
    body: 'Navoq is a digital credit management platform that allows businesses ("Restaurants/Shops") to manage customer tabs, debtors, and payments, and allows customers to view and manage their outstanding balances.',
  },
  {
    title: '3. User Responsibilities',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree not to misuse the platform or use it for unlawful purposes.',
  },
  {
    title: '4. Data Accuracy',
    body: 'Businesses are responsible for ensuring the accuracy of all orders, amounts, and debtor information entered into the system. Navoq is not liable for errors resulting from incorrect data entry.',
  },
  {
    title: '5. Payments and Credit',
    body: 'Navoq facilitates the tracking of credit between businesses and their customers. It does not process financial transactions directly. All payment arrangements are between the business and customer.',
  },
  {
    title: '6. Limitation of Liability',
    body: 'Nidaam Lab (Pty) Ltd shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use this service.',
  },
  {
    title: '7. Modifications',
    body: 'We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.',
  },
  {
    title: '8. Governing Law',
    body: 'These terms are governed by the laws of the Republic of South Africa.',
  },
  {
    title: '9. Contact',
    body: 'For any questions regarding these terms, contact us at legal@nidaamlab.co.za.',
  },
];

const WebTermsOfService = () => {
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
          <h1 className="wl-legal-title">Terms of Service</h1>
          <p className="wl-legal-meta">Last updated: May 2026</p>

          <p className="wl-legal-intro">
            Please read these Terms and Conditions carefully before using Navoq,
            operated by Nidaam Lab (Pty) Ltd.
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

export default WebTermsOfService;