import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPlatform, setInstallPlatform] = useState('');
  const observerRef = useRef(null);

  // Nav scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Fade-in on scroll
  useEffect(() => {
    const els = document.querySelectorAll('.w-fade');
    els.forEach(el => el.classList.add('w-fade-hidden'));
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('w-fade-visible'), i * 60);
          observerRef.current.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Chrome Android — native prompt available
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);

    if (isIOS) {
      setInstallPlatform('ios');
      setShowInstallModal(true);
    } else if (isAndroid) {
      setInstallPlatform('android');
      setShowInstallModal(true);
    } else {
      // Desktop — send to app
      navigate('/cashier/login');
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .wl-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .wl-root { font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.65; background: #080f0b; color: #eef2ee; overflow-x: hidden; }
        .wl-root a { text-decoration: none; color: inherit; cursor: pointer; }
        .wl-root ul { list-style: none; }
        .wl-root img { display: block; max-width: 100%; }

        /* Fade animations */
        .w-fade-hidden { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .w-fade-visible { opacity: 1; transform: translateY(0); }

        /* INSTALL MODAL */
        .wl-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: flex-end; justify-content: center; padding: 20px; }
        .wl-modal { background: #0f1f16; border: 1px solid rgba(29,184,122,0.2); border-radius: 24px 24px 20px 20px; padding: 32px 28px 28px; width: 100%; max-width: 440px; position: relative; }
        .wl-modal-close { position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.08); border: none; color: #8fa98f; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; line-height: 1; transition: background 0.2s; }
        .wl-modal-close:hover { background: rgba(255,255,255,0.14); }
        .wl-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .wl-modal-sub { font-size: 13px; color: #8fa98f; margin-bottom: 24px; }
        .wl-modal-steps { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .wl-modal-step { display: flex; align-items: flex-start; gap: 14px; }
        .wl-modal-step-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(29,184,122,0.15); border: 1px solid rgba(29,184,122,0.3); color: #1db87a; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .wl-modal-step-text { font-size: 14px; color: #c8dcc8; line-height: 1.5; }
        .wl-modal-step-text strong { color: #fff; font-weight: 600; }
        .wl-modal-icon-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .wl-modal-icon-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(29,184,122,0.1); border: 1px solid rgba(29,184,122,0.2); border-radius: 8px; padding: 4px 10px; font-size: 12px; color: #1db87a; font-weight: 600; }
        .wl-modal-btn { width: 100%; padding: 13px; background: #1db87a; color: #040d07; border: none; border-radius: 50px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s; }
        .wl-modal-btn:hover { background: #22d98e; }

        /* NAV */
        .wl-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(8,15,11,0.88); backdrop-filter: blur(18px); border-bottom: 1px solid transparent; transition: border-color 0.3s; }
        .wl-nav.scrolled { border-color: rgba(29,184,122,0.12); }
        .wl-nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 32px; padding: 0 24px; height: 64px; }
        .wl-nav-logo { display: flex; align-items: center; gap: 10px; font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 700; color: #fff; letter-spacing: 0.02em; }
        .wl-nav-links { display: flex; align-items: center; gap: 4px; margin-left: auto; }
        .wl-nav-links button { background: none; border: none; color: #8fa98f; font-size: 14px; font-weight: 500; padding: 6px 14px; border-radius: 50px; transition: color 0.2s, background 0.2s; cursor: pointer; }
        .wl-nav-links button:hover { color: #eef2ee; background: rgba(255,255,255,0.04); }
        .wl-nav-actions { display: flex; align-items: center; gap: 8px; }
        .wl-btn-ghost { background: none; border: none; color: #8fa98f; font-size: 14px; font-weight: 500; padding: 10px 18px; border-radius: 50px; transition: color 0.2s; cursor: pointer; }
        .wl-btn-ghost:hover { color: #eef2ee; }
        .wl-btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #1db87a; color: #040d07; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; padding: 10px 22px; border-radius: 50px; transition: all 0.2s; border: none; cursor: pointer; white-space: nowrap; }
        .wl-btn-primary:hover { background: #22d98e; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(29,184,122,0.35); }
        .wl-btn-primary.lg { padding: 14px 30px; font-size: 15px; }
        .wl-btn-outline { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(29,184,122,0.12); color: #eef2ee; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px; padding: 10px 22px; border-radius: 50px; transition: all 0.2s; background: none; cursor: pointer; }
        .wl-btn-outline:hover { border-color: #1db87a; color: #1db87a; }
        .wl-btn-outline.lg { padding: 14px 30px; font-size: 15px; }
        .wl-hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: auto; }
        .wl-hamburger span { display: block; width: 22px; height: 2px; background: #eef2ee; border-radius: 2px; transition: all 0.3s; }
        .wl-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .wl-hamburger.open span:nth-child(2) { opacity: 0; }
        .wl-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .wl-nav-mobile { display: none; flex-direction: column; gap: 4px; padding: 12px 24px 20px; border-top: 1px solid rgba(29,184,122,0.12); }
        .wl-nav-mobile.open { display: flex; }
        .wl-nav-mobile button { background: none; border: none; text-align: left; color: #8fa98f; font-size: 15px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); transition: color 0.2s; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .wl-nav-mobile button:last-child { border-bottom: none; margin-top: 8px; text-align: center; }
        .wl-nav-mobile button:hover { color: #eef2ee; }

        /* SECTION COMMON */
        .wl-section-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .wl-section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: #1db87a; margin-bottom: 12px; }
        .wl-section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 5vw, 52px); font-weight: 600; line-height: 1.15; color: #fff; margin-bottom: 16px; }
        .wl-section-sub { color: #8fa98f; font-size: 16px; max-width: 520px; margin-bottom: 48px; }
        .light .wl-section-label { color: #16935f; }
        .light .wl-section-title { color: #1a2b1f; }
        .light .wl-section-sub { color: #5a7060; }

        /* HERO */
        .wl-hero { min-height: 100vh; display: flex; align-items: center; position: relative; overflow: hidden; padding: 100px 0 80px; }
        .wl-hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .wl-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.25; }
        .wl-orb1 { width: 500px; height: 500px; background: radial-gradient(circle, #1db87a, transparent); top: -100px; left: -100px; }
        .wl-orb2 { width: 400px; height: 400px; background: radial-gradient(circle, #0d6b45, transparent); bottom: -80px; right: 200px; }
        .wl-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(29,184,122,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(29,184,122,0.04) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%); }
        .wl-hero-inner { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 0 24px; flex: 1; }
        .wl-hero-badge { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(29,184,122,0.12); border-radius: 50px; padding: 6px 14px; font-size: 12px; font-weight: 500; color: #1db87a; margin-bottom: 28px; background: rgba(29,184,122,0.06); }
        .wl-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #1db87a; animation: wlPulse 2s infinite; }
        @keyframes wlPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }
        .wl-hero-headline { font-family: 'Cormorant Garamond', serif; font-size: clamp(52px, 8vw, 96px); font-weight: 700; line-height: 1.05; color: #fff; margin-bottom: 24px; }
        .wl-hero-headline em { font-style: italic; color: #1db87a; }
        .wl-hero-sub { font-size: 17px; color: #8fa98f; max-width: 500px; margin-bottom: 36px; line-height: 1.7; }
        .wl-hero-cta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 52px; }
        .wl-hero-stats { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
        .wl-stat { display: flex; flex-direction: column; gap: 2px; }
        .wl-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #fff; }
        .wl-stat-label { font-size: 12px; color: #4d6b55; }
        .wl-stat-div { width: 1px; height: 32px; background: rgba(29,184,122,0.12); }

        /* Hero mockup */
        .wl-hero-mockup { position: absolute; right: 24px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 14px; z-index: 2; }
        .wl-mockup-card { background: #0f1f16; border: 1px solid rgba(29,184,122,0.12); border-radius: 20px; padding: 22px 26px; width: 320px; box-shadow: 0 8px 40px rgba(0,0,0,0.5); animation: wlFloat 4s ease-in-out infinite; }
        .wl-card2 { margin-left: 40px; animation-delay: -2s; padding: 18px 22px; }
        @keyframes wlFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .wl-mockup-header { display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 0.1em; color: #4d6b55; margin-bottom: 10px; }
        .wl-mh-dot { width: 8px; height: 8px; border-radius: 50%; background: #1db87a; }
        .wl-mh-live { margin-left: auto; display: flex; align-items: center; gap: 5px; color: #1db87a; font-size: 10px; font-weight: 600; }
        .wl-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #1db87a; animation: wlPulse 1.5s infinite; }
        .wl-mockup-amount { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 700; color: #fff; line-height: 1; }
        .wl-mockup-sub { font-size: 12px; color: #4d6b55; margin-top: 4px; margin-bottom: 16px; }
        .wl-mockup-row { display: flex; gap: 10px; }
        .wl-mockup-pill { flex: 1; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 3px; }
        .wl-pill-label { font-size: 9px; letter-spacing: 0.1em; color: #4d6b55; }
        .wl-pill-val { font-size: 16px; font-weight: 600; color: #fff; }
        .wl-pill-val.green { color: #1db87a; }
        .wl-mc2-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; color: #fff; }
        .wl-mc2-resto { font-size: 11px; color: #1db87a; margin-top: 2px; margin-bottom: 10px; }
        .wl-mc2-amt { font-size: 22px; font-weight: 700; color: #fff; font-family: 'Cormorant Garamond', serif; }
        .wl-mc2-status { font-size: 10px; letter-spacing: 0.1em; color: #4d6b55; margin-top: 4px; }

        /* FEATURES */
        .wl-features { padding: 100px 0; background: #f4f6f2; border-top: 1px solid #dde8e0; }
        .wl-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
        .wl-feat-card { background: #fff; border: 1px solid #dde8e0; border-radius: 20px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .wl-feat-card:hover { border-color: rgba(29,184,122,0.4); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .wl-feat-icon { width: 44px; height: 44px; background: rgba(29,184,122,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #16935f; margin-bottom: 16px; }
        .wl-feat-card h3 { font-size: 16px; font-weight: 600; color: #1a2b1f; margin-bottom: 8px; }
        .wl-feat-card p { font-size: 14px; color: #5a7060; line-height: 1.6; }

        /* HOW IT WORKS */
        .wl-how { padding: 100px 0; background: #080f0b; border-top: 1px solid rgba(255,255,255,0.07); }
        .wl-how-steps { display: flex; flex-direction: column; gap: 0; margin-top: 52px; max-width: 680px; }
        .wl-how-step { display: flex; gap: 28px; align-items: flex-start; }
        .wl-step-num { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 700; color: #1db87a; opacity: 0.35; line-height: 1; min-width: 64px; }
        .wl-step-content { padding-bottom: 8px; }
        .wl-step-content h3 { font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 6px; padding-top: 6px; }
        .wl-step-content p { font-size: 14px; color: #8fa98f; line-height: 1.65; }
        .wl-how-connector { width: 2px; height: 40px; background: rgba(29,184,122,0.12); margin-left: 31px; }

        /* PORTALS */
        .wl-portals { padding: 100px 0; background: #eef1ec; border-top: 1px solid #dde8e0; }
        .wl-portals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .wl-portal-card { background: #fff; border: 1px solid #dde8e0; border-radius: 20px; padding: 32px; display: flex; flex-direction: column; box-shadow: 0 4px 24px rgba(0,0,0,0.08); transition: border-color 0.2s, transform 0.2s; }
        .wl-portal-card:hover { transform: translateY(-4px); }
        .wl-portal-restaurant:hover { border-color: rgba(29,184,122,0.5); }
        .wl-portal-customer:hover { border-color: rgba(99,130,255,0.5); }
        .wl-portal-admin:hover { border-color: rgba(255,160,80,0.5); }
        .wl-portal-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .wl-portal-restaurant .wl-portal-icon { background: rgba(29,184,122,0.12); color: #16935f; }
        .wl-portal-customer .wl-portal-icon { background: rgba(99,130,255,0.12); color: #5470e8; }
        .wl-portal-admin .wl-portal-icon { background: rgba(255,160,80,0.12); color: #d4872a; }
        .wl-portal-tag { font-size: 10px; font-weight: 600; letter-spacing: 0.13em; margin-bottom: 8px; }
        .wl-portal-restaurant .wl-portal-tag { color: #16935f; }
        .wl-portal-customer .wl-portal-tag { color: #5470e8; }
        .wl-portal-admin .wl-portal-tag { color: #d4872a; }
        .wl-portal-card h3 { font-size: 20px; font-weight: 600; color: #1a2b1f; margin-bottom: 8px; }
        .wl-portal-card > p { font-size: 13.5px; color: #5a7060; line-height: 1.6; margin-bottom: 20px; }
        .wl-portal-features { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .wl-portal-features li { font-size: 13px; color: #5a7060; display: flex; align-items: center; gap: 8px; }
        .wl-portal-features li::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #b0c8b8; flex-shrink: 0; }
        .wl-btn-portal { display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; padding: 12px 20px; border-radius: 50px; font-size: 13.5px; font-weight: 600; width: 100%; transition: all 0.2s; border: 1.5px solid #dde8e0; color: #1a2b1f; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .wl-btn-portal:hover { background: #f4f6f2; }
        .wl-btn-portal-customer { border-color: rgba(84,112,232,0.3); color: #5470e8; }
        .wl-btn-portal-customer:hover { background: rgba(84,112,232,0.06); }
        .wl-btn-portal-admin { border-color: rgba(212,135,42,0.3); color: #d4872a; }
        .wl-btn-portal-admin:hover { background: rgba(212,135,42,0.06); }

        /* PRICING */
        .wl-pricing { padding: 100px 0; background: #0d1a12; border-top: 1px solid rgba(255,255,255,0.07); }
        .wl-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .wl-price-card { background: #0f1f16; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; position: relative; transition: transform 0.2s; }
        .wl-price-card:hover { transform: translateY(-4px); }
        .wl-price-featured { border-color: #1db87a; background: linear-gradient(160deg, #0f231a 0%, #0f1f16 100%); }
        .wl-price-badge { position: absolute; top: -1px; left: 50%; transform: translateX(-50%); background: #1db87a; color: #040d07; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; padding: 4px 14px; border-radius: 0 0 10px 10px; white-space: nowrap; }
        .wl-price-plan { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; color: #8fa98f; margin-bottom: 12px; margin-top: 8px; }
        .wl-price-amt { font-family: 'Cormorant Garamond', serif; font-size: 44px; font-weight: 700; color: #fff; line-height: 1; }
        .wl-price-featured .wl-price-amt { color: #1db87a; }
        .wl-price-period { font-size: 13px; color: #4d6b55; margin-top: 4px; margin-bottom: 24px; }
        .wl-price-features { display: flex; flex-direction: column; gap: 10px; }
        .wl-price-features li { font-size: 13.5px; color: #8fa98f; display: flex; align-items: center; gap: 10px; }
        .wl-price-features li::before { content: '✓'; color: #1db87a; font-weight: 700; font-size: 12px; flex-shrink: 0; }
        .wl-price-features li.disabled { color: #4d6b55; }
        .wl-price-features li.disabled::before { content: '–'; color: #4d6b55; }
        .wl-btn-outline-full { display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid rgba(29,184,122,0.12); color: #eef2ee; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px; padding: 12px 22px; border-radius: 50px; transition: all 0.2s; background: none; cursor: pointer; width: 100%; margin-top: 24px; }
        .wl-btn-outline-full:hover { border-color: #1db87a; color: #1db87a; }
        .wl-btn-primary-full { display: flex; align-items: center; justify-content: center; gap: 8px; background: #1db87a; color: #040d07; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; padding: 12px 22px; border-radius: 50px; transition: all 0.2s; border: none; cursor: pointer; width: 100%; margin-top: 24px; }
        .wl-btn-primary-full:hover { background: #22d98e; }

        /* DOWNLOAD */
        .wl-download { border-top: 1px solid rgba(255,255,255,0.07); overflow: hidden; }
        .wl-download-split { display: flex; min-height: 520px; }
        .wl-download-left { flex: 1; background: #0a1510; padding: 80px 60px 80px 0; display: flex; align-items: center; justify-content: flex-end; }
        .wl-download-left-inner { max-width: 440px; }
        .wl-download-left p { font-size: 16px; color: #8fa98f; margin-bottom: 32px; }
        .wl-download-right { flex: 1; background: #f4f6f2; display: flex; align-items: center; justify-content: center; padding: 60px 40px; position: relative; overflow: hidden; }
        .wl-download-right::before { content: ''; position: absolute; top: -60px; right: -60px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(29,184,122,0.1), transparent); }
        .wl-download-btns { display: flex; flex-direction: column; gap: 14px; }
        .wl-btn-download { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #dde8e0; border-radius: 14px; padding: 14px 22px; transition: all 0.2s; color: #1a2b1f; box-shadow: 0 4px 24px rgba(0,0,0,0.08); cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .wl-btn-download:hover { border-color: #1db87a; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(29,184,122,0.15); }
        .wl-btn-download svg { color: #16935f; flex-shrink: 0; }
        .wl-dl-small { display: block; font-size: 11px; color: #5a7060; }
        .wl-dl-big { display: block; font-size: 15px; font-weight: 600; color: #1a2b1f; }

        /* App mockup phones */
        .wl-app-mockup-wrap { display: flex; gap: 16px; align-items: flex-start; }
        .wl-app-phone { width: 200px; background: #0d1a12; border: 1px solid rgba(29,184,122,0.2); border-radius: 28px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 6px rgba(29,184,122,0.06); animation: wlFloat 4s ease-in-out infinite; }
        .wl-app-phone-2 { margin-top: 32px; animation-delay: -2s; background: #f4f6f2; border-color: #dde8e0; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
        .wl-phone-topbar { background: #0a1510; padding: 10px 14px 6px; display: flex; align-items: center; gap: 8px; }
        .wl-ptb-logo { width: 22px; height: 22px; background: #1db87a; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #040d07; }
        .wl-ptb-name { font-size: 10px; font-weight: 600; color: #eef2ee; }
        .wl-ptb-sub { font-size: 8px; color: #1db87a; }
        .wl-phone-hero-card { margin: 8px; border-radius: 14px; padding: 16px; background: linear-gradient(135deg, #0f3d26 0%, #0a1f14 100%); border: 1px solid rgba(29,184,122,0.2); }
        .wl-phc-label { font-size: 8px; letter-spacing: 0.1em; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
        .wl-phc-amt { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #fff; line-height: 1; }
        .wl-phc-sub { font-size: 8px; color: rgba(255,255,255,0.4); margin-top: 2px; margin-bottom: 10px; }
        .wl-phc-stats { display: flex; gap: 6px; }
        .wl-phc-stat { flex: 1; background: rgba(255,255,255,0.06); border-radius: 8px; padding: 6px 8px; }
        .wl-phcs-label { font-size: 7px; letter-spacing: 0.08em; color: rgba(255,255,255,0.3); }
        .wl-phcs-val { font-size: 12px; font-weight: 600; color: #fff; }
        .wl-phcs-val.g { color: #1db87a; }
        .wl-phone-section-label { font-size: 8px; font-weight: 600; color: #4d6b55; letter-spacing: 0.1em; padding: 8px 14px 4px; }
        .wl-phone-debtor-row { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-top: 1px solid rgba(255,255,255,0.04); }
        .wl-pdr-avatar { width: 24px; height: 24px; border-radius: 50%; background: rgba(29,184,122,0.2); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; color: #1db87a; flex-shrink: 0; }
        .wl-pdr-info { flex: 1; }
        .wl-pdr-name { font-size: 10px; font-weight: 500; color: #eef2ee; }
        .wl-pdr-tab { font-size: 8px; color: #4d6b55; }
        .wl-pdr-amt { font-size: 10px; font-weight: 600; color: #fff; font-family: 'Cormorant Garamond', serif; }
        .wl-phone-nav-bar { display: flex; background: #0a1510; border-top: 1px solid rgba(255,255,255,0.06); padding: 8px 0 10px; }
        .wl-pnb-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 7px; color: #4d6b55; }
        .wl-pnb-item.active { color: #1db87a; }
        .wl-pnb-dot { width: 3px; height: 3px; border-radius: 50%; background: #1db87a; margin-top: 1px; }
        .wl-phone-light-header { background: #fff; padding: 10px 14px 8px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; }
        .wl-plh-name { font-size: 14px; font-weight: 600; color: #1a2b1f; font-family: 'Cormorant Garamond', serif; }
        .wl-plh-live { display: flex; align-items: center; gap: 4px; font-size: 8px; color: #16935f; font-weight: 600; }
        .wl-plh-live-dot { width: 5px; height: 5px; border-radius: 50%; background: #1db87a; animation: wlPulse 1.5s infinite; }
        .wl-phone-light-card { margin: 8px; border-radius: 14px; padding: 16px; background: linear-gradient(135deg, #0a1f14 0%, #0f3d26 100%); }
        .wl-plc-label { font-size: 8px; letter-spacing: 0.1em; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
        .wl-plc-amt { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 700; color: #fff; }
        .wl-plc-sub { font-size: 8px; color: rgba(255,255,255,0.45); margin-top: 2px; margin-bottom: 10px; }
        .wl-plc-row { display: flex; gap: 6px; }
        .wl-plc-pill { flex: 1; background: rgba(255,255,255,0.1); border-radius: 8px; padding: 6px 8px; }
        .wl-plcp-label { font-size: 7px; letter-spacing: 0.07em; color: rgba(255,255,255,0.45); }
        .wl-plcp-val { font-size: 13px; font-weight: 600; color: #fff; }
        .wl-phone-tab-row { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #fff; margin: 0 8px 6px; border-radius: 10px; border: 1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .wl-ptr-thumb { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #1db87a, #0a5c35); flex-shrink: 0; }
        .wl-ptr-info { flex: 1; }
        .wl-ptr-name { font-size: 10px; font-weight: 600; color: #1a2b1f; }
        .wl-ptr-code { font-size: 8px; color: #16935f; }
        .wl-ptr-amt { font-size: 11px; font-weight: 700; color: #1a2b1f; font-family: 'Cormorant Garamond', serif; }
        .wl-ptr-status { font-size: 7px; color: #aaa; }

        /* FOOTER */
        .wl-footer { background: #0d1117; border-top: 1px solid rgba(255,255,255,0.07); padding: 60px 0 32px; }
        .wl-footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .wl-footer-top { display: flex; justify-content: space-between; gap: 48px; padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.07); flex-wrap: wrap; }
        .wl-footer-brand { display: flex; align-items: flex-start; gap: 12px; }
        .wl-footer-name { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 700; color: #fff; letter-spacing: 0.02em; line-height: 1; }
        .wl-footer-tagline { font-size: 12px; color: #4d6b55; }
        .wl-footer-links { display: flex; gap: 60px; flex-wrap: wrap; }
        .wl-footer-col { display: flex; flex-direction: column; gap: 10px; }
        .wl-footer-col-title { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: #8fa98f; margin-bottom: 4px; }
        .wl-footer-col a, .wl-footer-col button { font-size: 13.5px; color: #4d6b55; transition: color 0.2s; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: left; padding: 0; }
        .wl-footer-col a:hover, .wl-footer-col button:hover { color: #1db87a; }
        .wl-footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; font-size: 12.5px; color: #4d6b55; flex-wrap: wrap; gap: 8px; }

        /* RESPONSIVE */
        @media (max-width: 1100px) { .wl-hero-mockup { display: none; } }
        @media (max-width: 900px) {
          .wl-features-grid, .wl-portals-grid, .wl-pricing-grid { grid-template-columns: 1fr 1fr; }
          .wl-download-split { flex-direction: column; }
          .wl-download-left { padding: 60px 24px; justify-content: flex-start; }
          .wl-download-left-inner { max-width: 100%; }
          .wl-download-right { padding: 40px 24px; }
        }
        @media (max-width: 640px) {
          .wl-features-grid, .wl-portals-grid, .wl-pricing-grid { grid-template-columns: 1fr; }
          .wl-nav-links, .wl-nav-actions { display: none; }
          .wl-hamburger { display: flex; }
          .wl-hero { padding: 90px 0 60px; }
          .wl-hero-cta { flex-direction: column; align-items: flex-start; }
          .wl-how-steps { max-width: 100%; }
          .wl-footer-links { gap: 32px; }
          .wl-app-mockup-wrap { justify-content: center; }
          .wl-app-phone-2 { display: none; }
        }
      `}</style>

      <div className="wl-root">

        {/* INSTALL MODAL */}
        {showInstallModal && (
          <div className="wl-modal-overlay" onClick={() => setShowInstallModal(false)}>
            <div className="wl-modal" onClick={e => e.stopPropagation()}>
              <button className="wl-modal-close" onClick={() => setShowInstallModal(false)}>×</button>
              <div className="wl-modal-title">Install Navoq</div>
              {installPlatform === 'ios' ? (
                <>
                  <div className="wl-modal-sub">Follow these steps in Safari to add Navoq to your home screen.</div>
                  <div className="wl-modal-steps">
                    <div className="wl-modal-step">
                      <div className="wl-modal-step-num">1</div>
                      <div className="wl-modal-step-text">
                        Tap the <strong>Share</strong> button at the bottom of Safari
                        <div className="wl-modal-icon-row">
                          <span className="wl-modal-icon-badge">⬆ Share</span>
                        </div>
                      </div>
                    </div>
                    <div className="wl-modal-step">
                      <div className="wl-modal-step-num">2</div>
                      <div className="wl-modal-step-text">Scroll down and tap <strong>"Add to Home Screen"</strong></div>
                    </div>
                    <div className="wl-modal-step">
                      <div className="wl-modal-step-num">3</div>
                      <div className="wl-modal-step-text">Tap <strong>Add</strong> in the top right — done!</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="wl-modal-sub">Follow these steps in Chrome to install Navoq on your device.</div>
                  <div className="wl-modal-steps">
                    <div className="wl-modal-step">
                      <div className="wl-modal-step-num">1</div>
                      <div className="wl-modal-step-text">
                        Tap the <strong>3-dot menu</strong> in the top right of Chrome
                        <div className="wl-modal-icon-row">
                          <span className="wl-modal-icon-badge">⋮ Menu</span>
                        </div>
                      </div>
                    </div>
                    <div className="wl-modal-step">
                      <div className="wl-modal-step-num">2</div>
                      <div className="wl-modal-step-text">Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></div>
                    </div>
                    <div className="wl-modal-step">
                      <div className="wl-modal-step-num">3</div>
                      <div className="wl-modal-step-text">Tap <strong>Add</strong> to confirm — Navoq will appear on your home screen.</div>
                    </div>
                  </div>
                </>
              )}
              <button className="wl-modal-btn" onClick={() => setShowInstallModal(false)}>Got it</button>
            </div>
          </div>
        )}

        {/* NAV */}
        <nav className={`wl-nav${scrolled ? ' scrolled' : ''}`}>
          <div className="wl-nav-inner">
            <a className="wl-nav-logo" href="#hero"><span>Navoq</span></a>
            <ul className="wl-nav-links">
              {['features','how','portals','pricing'].map(id => (
                <li key={id}><button onClick={() => scrollTo(id)}>{id === 'how' ? 'How it works' : id.charAt(0).toUpperCase() + id.slice(1)}</button></li>
              ))}
            </ul>
            <div className="wl-nav-actions">
              <button className="wl-btn-ghost" onClick={() => scrollTo('portals')}>Sign In</button>
              <button className="wl-btn-primary" onClick={() => scrollTo('download')}>Get the App</button>
            </div>
            <button className={`wl-hamburger${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
          <div className={`wl-nav-mobile${mobileOpen ? ' open' : ''}`}>
            {['Features','How it works','Portals','Pricing'].map((label, i) => (
              <button key={i} onClick={() => scrollTo(['features','how','portals','pricing'][i])}>{label}</button>
            ))}
            <button className="wl-btn-primary" onClick={() => scrollTo('portals')}>Sign In</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="wl-hero" id="hero">
          <div className="wl-hero-bg">
            <div className="wl-orb wl-orb1" />
            <div className="wl-orb wl-orb2" />
            <div className="wl-hero-grid" />
          </div>
          <div className="wl-hero-inner">
            <div className="wl-hero-badge w-fade"><span className="wl-badge-dot" />Digital Credit Management</div>
            <h1 className="wl-hero-headline w-fade">Track. Settle.<br /><em>Done.</em></h1>
            <p className="wl-hero-sub w-fade">Navoq lets restaurants and shops manage customer credit tabs digitally — no paper, no disputes, no chasing. Customers see their balance in real time.</p>
            <div className="wl-hero-cta w-fade">
              <button className="wl-btn-primary lg" onClick={() => scrollTo('download')}>
                Download the App
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16l-4-4h3V4h2v8h3l-4 4z"/><path d="M20 20H4"/></svg>
              </button>
              <button className="wl-btn-outline lg" onClick={() => scrollTo('how')}>See how it works</button>
            </div>
            <div className="wl-hero-stats w-fade">
              <div className="wl-stat"><span className="wl-stat-num">100%</span><span className="wl-stat-label">Digital</span></div>
              <div className="wl-stat-div" />
              <div className="wl-stat"><span className="wl-stat-num">Real-time</span><span className="wl-stat-label">Balance Updates</span></div>
              <div className="wl-stat-div" />
              <div className="wl-stat"><span className="wl-stat-num">Zero</span><span className="wl-stat-label">Paper Needed</span></div>
            </div>
          </div>
          <div className="wl-hero-mockup">
            <div className="wl-mockup-card">
              <div className="wl-mockup-header"><div className="wl-mh-dot" /><span>TOTAL OUTSTANDING</span><div className="wl-mh-live"><span className="wl-live-dot" />LIVE</div></div>
              <div className="wl-mockup-amount">R 1,970.50</div>
              <div className="wl-mockup-sub">Across all tabs</div>
              <div className="wl-mockup-row">
                {[['PENDING','R 0,00'],['DEBTORS','3'],['SETTLED','1']].map(([label, val], i) => (
                  <div key={i} className="wl-mockup-pill"><span className="wl-pill-label">{label}</span><span className={`wl-pill-val${i===2?' green':''}`}>{val}</span></div>
                ))}
              </div>
            </div>
            <div className="wl-mockup-card wl-card2">
              <div className="wl-mc2-name">John</div>
              <div className="wl-mc2-resto">The Corner Bistro · TCB-001</div>
              <div className="wl-mc2-amt">R 450,50</div>
              <div className="wl-mc2-status">OUTSTANDING</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="wl-features" id="features">
          <div className="wl-section-inner">
            <div className="wl-section-label w-fade">WHAT WE SOLVE</div>
            <h2 className="wl-section-title w-fade" style={{color:'#1a2b1f'}}>Everything a tab system should be</h2>
            <div className="wl-features-grid">
              {[
                { icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>, title: 'Track Credit', desc: 'Create and manage customer credit tabs digitally. Every transaction logged, timestamped, and visible to both parties.' },
                { icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, title: 'Manage Debtors', desc: "See all your customers in one place. Know who owes what, when tabs were opened, and who's overdue at a glance." },
                { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, title: 'Dispute Resolution', desc: 'Customers can flag disputed charges directly in the app. Restaurants respond and resolve — all in one thread.' },
                { icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>, title: 'Real-time Balances', desc: 'Customers see their outstanding balance live. No calling the restaurant, no surprises at month end.' },
                { icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01"/></>, title: 'QR Code Linking', desc: 'Customers scan a QR code to link with a restaurant instantly. No forms, no manual entry, no friction.' },
                { icon: <><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>, title: 'Month-end Reports', desc: 'Generate clean month-end summaries for your records. Know exactly what was settled and what\'s still outstanding.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="wl-feat-card w-fade">
                  <div className="wl-feat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{icon}</svg></div>
                  <h3>{title}</h3><p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="wl-how" id="how">
          <div className="wl-section-inner">
            <div className="wl-section-label w-fade">HOW IT WORKS</div>
            <h2 className="wl-section-title w-fade">Up and running in minutes</h2>
            <div className="wl-how-steps">
              {[
                { num: '01', title: 'Restaurant signs up', desc: 'Create your restaurant or shop account. Set up your profile, invite link, and QR code in under 5 minutes.' },
                { num: '02', title: 'Customer links via QR', desc: "Customer downloads Navoq, scans your QR code or uses your invite link. They're linked instantly — no paperwork." },
                { num: '03', title: 'Tab opens, charges added', desc: 'Restaurant opens a tab and logs charges as they happen. Customer sees every update in real time on their phone.' },
                { num: '04', title: 'Settle & close', desc: 'When the customer pays, mark the tab settled. Both sides get a record. Clean, simple, done.' },
              ].map(({ num, title, desc }, i) => (
                <React.Fragment key={num}>
                  <div className="wl-how-step w-fade">
                    <div className="wl-step-num">{num}</div>
                    <div className="wl-step-content"><h3>{title}</h3><p>{desc}</p></div>
                  </div>
                  {i < 3 && <div className="wl-how-connector" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* PORTALS */}
        <section className="wl-portals" id="portals">
          <div className="wl-section-inner">
            <div className="wl-section-label w-fade">ACCESS PORTALS</div>
            <h2 className="wl-section-title w-fade" style={{color:'#1a2b1f'}}>Sign in to your portal</h2>
            <p className="wl-section-sub w-fade" style={{color:'#5a7060'}}>Navoq has three separate portals — each built for its role.</p>
            <div className="wl-portals-grid">
              {[
                { cls: 'wl-portal-restaurant', tag: 'RESTAURANT / SHOP', title: 'Business Portal', desc: 'Manage your debtors, open tabs, log transactions, generate reports, and handle disputes.', features: ['Dashboard & analytics','Debtor management','Tab & transaction logs','Month-end reports','QR code & invite links'], btnCls: '', btnLabel: 'Sign In as Business', path: '/cashier/login', icon: <path d="M3 11l19-9-9 19-2-8-8-2z"/> },
                { cls: 'wl-portal-customer', tag: 'CUSTOMER', title: 'Customer Portal', desc: 'View your outstanding tabs across all restaurants, log orders, raise disputes, and track your history.', features: ['Live balance overview','Multi-restaurant tabs','Order history','Dispute logging','Invite & share codes'], btnCls: 'wl-btn-portal-customer', btnLabel: 'Sign In as Customer', path: '/customer/login', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
                { cls: 'wl-portal-admin', tag: 'ADMIN', title: 'Admin Portal', desc: 'Full platform control. Monitor all businesses, customers, and transactions across the entire Navoq network.', features: ['Platform-wide analytics','All restaurants & customers','Account management','Dispute oversight','System configuration'], btnCls: 'wl-btn-portal-admin', btnLabel: 'Admin Login', path: '/admin/login', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
              ].map(({ cls, tag, title, desc, features, btnCls, btnLabel, path, icon }) => (
                <div key={title} className={`wl-portal-card ${cls} w-fade`}>
                  <div className="wl-portal-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{icon}</svg></div>
                  <div className="wl-portal-tag">{tag}</div>
                  <h3>{title}</h3><p>{desc}</p>
                  <ul className="wl-portal-features">{features.map(f => <li key={f}>{f}</li>)}</ul>
                  <button className={`wl-btn-portal ${btnCls}`} onClick={() => navigate(path)}>
                    {btnLabel}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="wl-pricing" id="pricing">
          <div className="wl-section-inner">
            <div className="wl-section-label w-fade">PRICING</div>
            <h2 className="wl-section-title w-fade">Simple, transparent pricing</h2>
            <p className="wl-section-sub w-fade">Start free. Upgrade when you grow.</p>
            <div className="wl-pricing-grid">
              {[
                { plan: 'Starter', amt: 'Free', period: 'forever', featured: false, features: ['Up to 10 customers','Unlimited tabs','QR code linking','Basic reports'], disabled: ['Dispute resolution','Push notifications'], cta: <button className="wl-btn-outline-full" onClick={() => scrollTo('download')}>Get Started Free</button> },
                { plan: 'Pro', amt: 'R199', period: 'per month', featured: true, features: ['Unlimited customers','Unlimited tabs','QR code linking','Full reports & analytics','Dispute resolution','Push notifications'], disabled: [], cta: <button className="wl-btn-primary-full" onClick={() => scrollTo('download')}>Start Pro Trial</button> },
                { plan: 'Enterprise', amt: 'Custom', period: 'contact us', featured: false, features: ['Multiple branches','Dedicated support','Custom integrations','White labelling','SLA guarantee','Admin dashboard'], disabled: [], cta: <a className="wl-btn-outline-full" href="mailto:hello@navoq.co.za" style={{display:'flex',alignItems:'center',justifyContent:'center',marginTop:'24px'}}>Contact Sales</a> },
              ].map(({ plan, amt, period, featured, features, disabled, cta }) => (
                <div key={plan} className={`wl-price-card${featured ? ' wl-price-featured' : ''} w-fade`}>
                  {featured && <div className="wl-price-badge">MOST POPULAR</div>}
                  <div className="wl-price-plan">{plan}</div>
                  <div className="wl-price-amt">{amt}</div>
                  <div className="wl-price-period">{period}</div>
                  <ul className="wl-price-features">
                    {features.map(f => <li key={f}>{f}</li>)}
                    {disabled.map(f => <li key={f} className="disabled">{f}</li>)}
                  </ul>
                  {cta}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DOWNLOAD */}
        <section className="wl-download" id="download">
          <div className="wl-download-split">
            <div className="wl-download-left">
              <div className="wl-download-left-inner">
                <div className="wl-section-label w-fade">GET THE APP</div>
                <h2 className="wl-section-title w-fade">Download Navoq today</h2>
                <p className="w-fade">Available as a Progressive Web App — install directly from your browser. No app store needed.</p>
                <div className="wl-download-btns w-fade">
                  <button className="wl-btn-download" onClick={handleInstall}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16l-4-4h3V4h2v8h3l-4 4z"/><path d="M20 20H4"/></svg>
                    <div><span className="wl-dl-small">Install as</span><span className="wl-dl-big">Web App (PWA)</span></div>
                  </button>
                  <button className="wl-btn-download">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/><path d="M8 12l4-4 4 4M12 8v8"/></svg>
                    <div><span className="wl-dl-small">Coming soon to</span><span className="wl-dl-big">Google Play</span></div>
                  </button>
                </div>
              </div>
            </div>
            <div className="wl-download-right">
              <div className="wl-app-mockup-wrap">
                <div className="wl-app-phone">
                  <div className="wl-phone-topbar">
                    <div className="wl-ptb-logo">N</div>
                    <div><div className="wl-ptb-name">Navoq</div><div className="wl-ptb-sub">RESTAURANT PORTAL</div></div>
                  </div>
                  <div className="wl-phone-hero-card">
                    <div className="wl-phc-label">TOTAL OUTSTANDING</div>
                    <div className="wl-phc-amt">R 1,970.50</div>
                    <div className="wl-phc-sub">Across all tabs</div>
                    <div className="wl-phc-stats">
                      {[['PENDING','R 0,00'],['DEBTORS','3'],['SETTLED','1']].map(([l,v],i)=>(
                        <div key={i} className="wl-phc-stat"><div className="wl-phcs-label">{l}</div><div className={`wl-phcs-val${i===2?' g':''}`}>{v}</div></div>
                      ))}
                    </div>
                  </div>
                  <div className="wl-phone-section-label">RECENT DEBTORS</div>
                  {[['J','John','TCB-001','R 450,50'],['S','Sarah','TCB-002','R 320,00'],['M','Mike','TCB-003','R 1,200,00']].map(([av,name,tab,amt])=>(
                    <div key={name} className="wl-phone-debtor-row">
                      <div className="wl-pdr-avatar">{av}</div>
                      <div className="wl-pdr-info"><div className="wl-pdr-name">{name}</div><div className="wl-pdr-tab">{tab} · Open</div></div>
                      <div className="wl-pdr-amt">{amt}</div>
                    </div>
                  ))}
                  <div className="wl-phone-nav-bar">
                    {[['Home',true],['Debtors',false],['Reports',false]].map(([label,active])=>(
                      <div key={label} className={`wl-pnb-item${active?' active':''}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                        {label}{active && <div className="wl-pnb-dot" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="wl-app-phone wl-app-phone-2">
                  <div className="wl-phone-light-header">
                    <div className="wl-plh-name">John</div>
                    <div className="wl-plh-live"><div className="wl-plh-live-dot" /> LIVE</div>
                  </div>
                  <div className="wl-phone-light-card">
                    <div className="wl-plc-label">TOTAL OUTSTANDING</div>
                    <div className="wl-plc-amt">R 770,50</div>
                    <div className="wl-plc-sub">Across 2 restaurants</div>
                    <div className="wl-plc-row">
                      {[['PLACES','2'],['DISPUTES','0']].map(([l,v])=>(
                        <div key={l} className="wl-plc-pill"><div className="wl-plcp-label">{l}</div><div className="wl-plcp-val">{v}</div></div>
                      ))}
                    </div>
                  </div>
                  {[['The Corner Bistro','TCB-001','R 450,50','linear-gradient(135deg,#1db87a,#0a5c35)'],['The Green Bistro','TGB-002','R 320,00','linear-gradient(135deg,#2a8a5c,#0a3d22)']].map(([name,code,amt,bg])=>(
                    <div key={name} className="wl-phone-tab-row">
                      <div className="wl-ptr-thumb" style={{background:bg}} />
                      <div className="wl-ptr-info"><div className="wl-ptr-name">{name}</div><div className="wl-ptr-code">{code}</div></div>
                      <div style={{textAlign:'right'}}><div className="wl-ptr-amt">{amt}</div><div className="wl-ptr-status">OUTSTANDING</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="wl-footer">
          <div className="wl-footer-inner">
            <div className="wl-footer-top">
              <div className="wl-footer-brand">
                <div>
                  <div className="wl-footer-name">Navoq</div>
                  <div className="wl-footer-tagline">Track | Settle | Done.</div>
                </div>
              </div>
              <div className="wl-footer-links">
                <div className="wl-footer-col">
                  <div className="wl-footer-col-title">Product</div>
                  {['features','how','pricing','download'].map((id,i)=>(
                    <button key={id} onClick={() => scrollTo(id)}>{['Features','How it works','Pricing','Download'][i]}</button>
                  ))}
                </div>
                <div className="wl-footer-col">
                  <div className="wl-footer-col-title">Portals</div>
                  <button onClick={() => navigate('/cashier/login')}>Restaurant Login</button>
                  <button onClick={() => navigate('/customer/login')}>Customer Login</button>
                  <button onClick={() => navigate('/admin/login')}>Admin Login</button>
                </div>
                <div className="wl-footer-col">
                  <div className="wl-footer-col-title">Company</div>
                  <a href="#">About</a>
                  <a href="mailto:hello@navoq.co.za">Contact</a>
                  <button onClick={() => navigate('/privacy')}>Privacy Policy</button>
                  <button onClick={() => navigate('/terms')}>Terms of Service</button>
                </div>
              </div>
            </div>
            <div className="wl-footer-bottom">
              <span>© 2026 Navoq. A product of <strong>Nidaam Labs (Pty) Ltd</strong>. All rights reserved.</span>
              <span>Built in South Africa 🇿🇦</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Welcome;