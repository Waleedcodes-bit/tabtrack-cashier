import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Moon, Sun, FileText, ChevronRight, LogOut } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { useTheme } from '../../context/ThemeContext';

const Section = ({ title, children }) => (
  <div className="mb-5">
    <p className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 dark:text-white/30 mb-3 ml-1">{title}</p>
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
      {children}
    </div>
  </div>
);

const NavRow = ({ icon: Icon, iconBg, iconBgDark, iconColor, label, sub, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconBgDark || ''}`}>
      <Icon size={16} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">{sub}</p>}
    </div>
    <ChevronRight size={15} className="text-gray-300 dark:text-white/20 flex-shrink-0" />
  </button>
);

const CustomerSettings = () => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [fbSent, setFbSent] = useState(false);

  const handleSendFeedback = () => {
    if (!feedback.trim()) return;
    setFbSent(true);
    setFeedback('');
    setTimeout(() => setFbSent(false), 3000);
  };

  return (
    <CustomerLayout title="Settings" showBack>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

        {/* Left column */}
        <div>
          <Section title="Preferences">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                {darkMode
                  ? <Moon size={16} className="text-indigo-400" />
                  : <Sun size={16} className="text-yellow-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">
                  {darkMode ? 'Dark theme active' : 'Light theme active'}
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => setDarkMode(d => !d)}
                  className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 ${
                    darkMode ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    darkMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </Section>

          <Section title="Legal">
            <NavRow icon={FileText} iconBg="bg-gray-100" iconBgDark="dark:bg-white/10" iconColor="text-gray-500 dark:text-white/40"
              label="Terms & Conditions" sub="Read our terms of service" onClick={() => navigate('/terms')} />
            <NavRow icon={FileText} iconBg="bg-gray-100" iconBgDark="dark:bg-white/10" iconColor="text-gray-500 dark:text-white/40"
              label="Privacy Policy" sub="How we handle your data" onClick={() => navigate('/privacy')} />
          </Section>

          <Section title="Account">
            <NavRow icon={LogOut} iconBg="bg-red-50" iconBgDark="dark:bg-red-500/10" iconColor="text-red-500"
              label="Sign Out" sub="Log out of your account" onClick={() => navigate('/')} />
          </Section>

          <p className="text-[10px] text-gray-400 dark:text-white/20 pb-4 ml-1">
            TabTrack v1.0 — Nidaam Labs (Pty) Ltd
          </p>
        </div>

        {/* Right column — Feedback */}
        <div>
          <Section title="Feedback">
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={15} className="text-emerald-500" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Send us feedback</p>
              </div>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Tell us what you think or report an issue…"
                rows={6}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{ resize: 'none', WebkitUserSelect: 'text', userSelect: 'text' }}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm text-gray-700 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all block"
              />
              <button
                onClick={handleSendFeedback}
                disabled={!feedback.trim()}
                className={`mt-3 w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                  feedback.trim() ? 'text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed'
                }`}
                style={feedback.trim() ? { background: 'linear-gradient(145deg, #0d2137 0%, #0a3328 50%, #0f4d3a 100%)' } : {}}
              >
                {fbSent ? '✓ Feedback sent — thanks!' : 'Send Feedback'}
              </button>
            </div>
          </Section>
        </div>

      </div>
    </CustomerLayout>
  );
};

export default CustomerSettings;