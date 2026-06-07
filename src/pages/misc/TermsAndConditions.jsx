import React from 'react';
import MainLayout from '../../components/layout/MainLayout';

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

const TermsAndConditions = () => (
  <MainLayout title="Terms & Conditions" showBack>
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 space-y-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">Last updated: May 2026</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Please read these Terms and Conditions carefully before using Navoq, operated by Nidaam Lab (Pty) Ltd.
          </p>
        </div>
        {SECTIONS.map(({ title, body }) => (
          <div key={title}>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-gray-400 py-4">Nidaam Lab (Pty) Ltd — Navoq v1.0</p>
    </div>
  </MainLayout>
);

export default TermsAndConditions;
