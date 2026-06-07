// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMobile.classList.toggle('open');
});
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMobile.classList.remove('open');
  });
});

// ===== FADE IN ON SCROLL =====
const fadeEls = document.querySelectorAll(
  '.feat-card, .how-step, .portal-card, .price-card, .hero-badge, .hero-headline, .hero-sub, .hero-cta, .hero-stats, .section-label, .section-title, .section-sub, .download-text, .download-visual'
);
fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => observer.observe(el));

// ===== SMOOTH ACTIVE NAV =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 80) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}`
      ? 'var(--green)' : '';
  });
});

// ===== PWA INSTALL PROMPT =====
let deferredPrompt = null;

// Catch the install prompt before it fires
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show the PWA install button (unhide if hidden)
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) installBtn.style.display = 'flex';
});

// Handle install button click
const installBtn = document.getElementById('pwa-install-btn');
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA install outcome:', outcome);
      deferredPrompt = null;
    } else {
      // Fallback — browser doesn't support prompt (e.g. iOS Safari)
      // Just navigate to the app
      window.location.href = '/cashier/login';
    }
  });
}

// When app is successfully installed
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  console.log('Navoq PWA installed');
});