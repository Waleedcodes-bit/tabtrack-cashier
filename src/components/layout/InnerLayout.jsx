import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Sidebar } from './MainLayout';

const InnerLayout = ({ children, title, showBack = false, rightAction }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#080d17] text-white font-['DM_Sans'] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#080d17]">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors active:scale-90"
              >
                <ChevronLeft size={18} className="text-white" />
              </button>
            )}
            <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
          </div>
          {rightAction && <div>{rightAction}</div>}
        </header>

        {/* Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default InnerLayout;
