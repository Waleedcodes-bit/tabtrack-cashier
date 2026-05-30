import React from 'react';
import MainLayout from '../../components/layout/MainLayout';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide when registering, including your business name, email address, and phone number. We also collect usage data such as transactions, orders, and payment records entered into the platform.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to provide and improve the TabTrack service, to communicate with you about your account, and to ensure the security and integrity of the platform.',
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
    body: 'Businesses using TabTrack are responsible for obtaining appropriate consent from their customers before adding them to the platform as debtors.',
  },
  {
    title: '6. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@nidaamlab.co.za.',
  },
  {
    title: '7. Cookies',
    body: 'TabTrack may use local storage and session data to maintain your login state and preferences. No third-party advertising cookies are used.',
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

const PrivacyPolicy = () => (
  <MainLayout title="Privacy Policy" showBack>
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 space-y-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">Last updated: May 2026</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            This Privacy Policy explains how Nidaam Lab (Pty) Ltd collects, uses, and protects your information when you use TabTrack.
          </p>
        </div>
        {SECTIONS.map(({ title, body }) => (
          <div key={title}>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-gray-400 py-4">Nidaam Lab (Pty) Ltd — TabTrack v1.0</p>
    </div>
  </MainLayout>
);

export default PrivacyPolicy;