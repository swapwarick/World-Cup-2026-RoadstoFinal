/* ═══════════════════════════════════════════════════════════════════════
   SCRIPT.JS — World Cup 2026 | Final Whistle
   ═══════════════════════════════════════════════════════════════════════ */

/* ─── COUNTDOWN ──────────────────────────────────────────────────────── */
const finalDate = new Date('2026-07-20T00:30:00+05:30').getTime();

const parts = {
  days:    document.getElementById('days'),
  hours:   document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
};

function pad(value) {
  return String(value).padStart(2, '0');
}

function updateCountdown() {
  const delta = Math.max(finalDate - Date.now(), 0);
  const days    = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const seconds = Math.floor((delta / 1000) % 60);
  if (parts.days)    parts.days.textContent    = pad(days);
  if (parts.hours)   parts.hours.textContent   = pad(hours);
  if (parts.minutes) parts.minutes.textContent = pad(minutes);
  if (parts.seconds) parts.seconds.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ─── HELPERS ────────────────────────────────────────────────────────── */
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function lerp(a, b, t) { return a + (b - a) * t; }

/* ─── PRELOADER ──────────────────────────────────────────────────────── */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const countEl   = document.getElementById('pre-count');
  const barEl     = document.getElementById('pre-bar');

  if (!preloader || !countEl) return;

  let current = 0;
  const target = 100;
  const duration = 1800; // ms
  const start = performance.now();

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function tick(now) {
    const elapsed  = now - start;
    const progress = clamp(elapsed / duration, 0, 1);
    const value    = Math.round(easeOut(progress) * target);

    if (value !== current) {
      current = value;
      countEl.textContent = String(current).padStart(2, '0');
      if (barEl) barEl.style.width = current + '%';
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      // Small pause then fade out
      setTimeout(() => {
        preloader.classList.add('is-done');
        // Show badge & menu after preloader
        document.getElementById('progress-badge')?.classList.add('is-visible');
        document.getElementById('menu-btn')?.classList.add('is-visible');
      }, 280);
    }
  }

  requestAnimationFrame(tick);
}

initPreloader();

/* ─── SCROLL PROGRESS BAR ────────────────────────────────────────────── */
function initScrollProgressBar() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct.toFixed(2) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

initScrollProgressBar();

/* ─── PROGRESS BADGE (section tracker) ──────────────────────────────── */
function initProgressBadge() {
  const sectionNameEl = document.getElementById('badge-section-name');
  const pctTextEl     = document.getElementById('badge-pct-text');
  const barBlueEl     = document.getElementById('badge-bar-blue');
  const barRedEl      = document.getElementById('badge-bar-red');

  if (!sectionNameEl) return;

  // Gather all labelled sections in order
  const sections = [...document.querySelectorAll('[data-label]')];

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const globalPct = docHeight > 0 ? clamp(scrollTop / docHeight, 0, 1) : 0;
    const pctInt    = Math.round(globalPct * 100);

    // Find current section
    let activeLabel = sections.length > 0 ? sections[0].dataset.label : '';
    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.6) {
        activeLabel = section.dataset.label;
      }
    }

    sectionNameEl.textContent = activeLabel;
    pctTextEl.textContent     = String(pctInt).padStart(2, '0') + '%';

    // Split bar: blue = 0→50%, red fills 50→100% of the badge bar
    if (barBlueEl && barRedEl) {
      const half = clamp(globalPct * 2, 0, 1);          // 0→1 for first half
      const secondHalf = clamp((globalPct - 0.5) * 2, 0, 1); // 0→1 for second half
      barBlueEl.style.width = (half * 100).toFixed(1) + '%';
      barRedEl.style.width  = (secondHalf * 100).toFixed(1) + '%';
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

initProgressBadge();

/* ─── MENU TOGGLE ────────────────────────────────────────────────────── */
function initMenu() {
  const menuBtn   = document.getElementById('menu-btn');
  const closeBtn  = document.getElementById('close-btn');
  const overlay   = document.getElementById('nav-overlay');
  if (!menuBtn || !overlay) return;

  function openMenu() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.style.opacity = '0';
    menuBtn.style.pointerEvents = 'none';
  }

  function closeMenu() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.style.opacity = '';
    menuBtn.style.pointerEvents = '';
  }

  menuBtn.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);

  // Close on nav link click
  overlay.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

initMenu();

/* ─── SCROLL REVEAL (IntersectionObserver) ───────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ─── CITY LIST REVEAL ───────────────────────────────────────────────── */
function initCityReveal() {
  const items = document.querySelectorAll('.city-item');
  if (!items.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger each city slightly
          const idx = [...items].indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, idx * 45);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((item) => obs.observe(item));
}

initCityReveal();

/* ─── BIGGEST EVER (sticky stats) ───────────────────────────────────── */
function initBiggestEver() {
  const section = document.getElementById('biggest-ever');
  if (!section) return;

  const stats = [...section.querySelectorAll('.biggest-stat')];
  const count = stats.length;

  // Add progress dots
  const stickyWrap = section.querySelector('.biggest-sticky-wrap');
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'biggest-dots';
  stats.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'biggest-dot' + (i === 0 ? ' is-active' : '');
    dotsWrap.appendChild(dot);
  });
  stickyWrap?.appendChild(dotsWrap);
  const dots = [...dotsWrap.querySelectorAll('.biggest-dot')];

  let lastActive = 0;

  function update() {
    const rect = section.getBoundingClientRect();
    // progress: 0 when section top hits viewport top, 1 when section bottom leaves viewport bottom
    const scrollRange = rect.height - window.innerHeight;
    const scrolled    = -rect.top;
    const progress    = clamp(scrolled / scrollRange, 0, 1);
    const raw         = progress * count;
    const activeIdx   = clamp(Math.floor(raw), 0, count - 1);

    if (activeIdx !== lastActive) {
      stats[lastActive]?.classList.remove('is-active');
      dots[lastActive]?.classList.remove('is-active');
      stats[activeIdx]?.classList.add('is-active');
      dots[activeIdx]?.classList.add('is-active');
      lastActive = activeIdx;
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

initBiggestEver();

/* ─── BALL MOTION ────────────────────────────────────────────────────── */
function getSectionState(section) {
  const isMobile = window.innerWidth <= 760;
  return {
    x:      Number((isMobile ? section.dataset.ballMobileX      : section.dataset.ballX)      ?? 70),
    y:      Number((isMobile ? section.dataset.ballMobileY      : section.dataset.ballY)      ?? 18),
    scale:  Number((isMobile ? section.dataset.ballMobileScale  : section.dataset.ballScale)  ?? 1),
    rotate: Number((isMobile ? section.dataset.ballMobileRotate : section.dataset.ballRotate) ?? 0),
  };
}

function mountBallMotion() {
  const shell    = document.getElementById('ball-shell');
  const model    = document.getElementById('cup-ball');
  const sections = [...document.querySelectorAll('.ball-section')];
  if (!shell || !model || !sections.length) return;

  model.addEventListener('load', () => {
    model.cameraOrbit    = '0deg 78deg 105%';
    model.fieldOfView    = '28deg';
  });

  function updateShellPosition() {
    const viewportCenter = window.innerHeight * 0.5;
    const metrics = sections.map((section) => {
      const rect = section.getBoundingClientRect();
      return {
        rect,
        state:  getSectionState(section),
        center: rect.top + rect.height / 2,
      };
    });

    let current = metrics[0];
    let next    = metrics[metrics.length - 1];

    for (let i = 0; i < metrics.length; i++) {
      if (metrics[i].center <= viewportCenter) {
        current = metrics[i];
        next    = metrics[Math.min(i + 1, metrics.length - 1)];
      }
    }

    let progress = 0;
    if (current !== next) {
      progress = clamp(
        (viewportCenter - current.center) / (next.center - current.center),
        0,
        1
      );
    }

    const x      = lerp(current.state.x,      next.state.x,      progress);
    const y      = lerp(current.state.y,       next.state.y,      progress);
    const scale  = lerp(current.state.scale,   next.state.scale,  progress);
    const rotate = lerp(current.state.rotate,  next.state.rotate, progress);

    shell.style.setProperty('--ball-left',  `${x}vw`);
    shell.style.setProperty('--ball-top',   `${y}vh`);
    shell.style.setProperty('--ball-scale', scale.toFixed(3));
    model.style.transform = `rotate(${rotate}deg)`;
  }

  updateShellPosition();
  window.addEventListener('scroll', updateShellPosition, { passive: true });
  window.addEventListener('resize', updateShellPosition);
}

mountBallMotion();
