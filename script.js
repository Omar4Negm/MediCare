/* ============================================================
   MediCare Pharmacy — script.js
   Vanilla JS: Nav, Reveal, FAQ, Countdown, Search, Back-to-Top
   ============================================================ */

'use strict';

/* ── Helpers ──────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── 1. Sticky Nav + Active Link ─────────────────────────── */
(function initNav() {
  const navbar   = $('.navbar');
  const toggle   = $('.nav-toggle');
  const navLinks = $('.nav-links');

  // Scrolled shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Hamburger
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      // Animate bars
      const bars = $$('span', toggle);
      if (open) {
        bars[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        bars[1].style.opacity   = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
      }
    });

    // Close on link click (mobile)
    $$('a', navLinks).forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      $$('span', toggle).forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }));
  }

  // Active state
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── 2. Scroll Reveal ────────────────────────────────────── */
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Stagger children if group
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add('visible'), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el, i) => {
    // Auto-stagger siblings in same parent
    const siblings = $$('.reveal', el.parentElement);
    if (siblings.length > 1 && !el.dataset.delay) {
      el.dataset.delay = siblings.indexOf(el) * 80;
    }
    io.observe(el);
  });
})();

/* ── 3. FAQ Accordion ────────────────────────────────────── */
(function initFAQ() {
  $$('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      $$('.faq-item.open').forEach(i => i.classList.remove('open'));

      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ── 4. Back to Top ──────────────────────────────────────── */
(function initBackTop() {
  const btn = $('#back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── 5. Countdown Timer ──────────────────────────────────── */
(function initCountdown() {
  const display = {
    days:    $('#cd-days'),
    hours:   $('#cd-hours'),
    minutes: $('#cd-minutes'),
    seconds: $('#cd-seconds'),
  };
  if (!display.days) return;

  // Target: 3 days from now
  const target = new Date();
  target.setDate(target.getDate() + 3);
  target.setHours(23, 59, 59, 0);

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      Object.values(display).forEach(el => { if (el) el.textContent = '00'; });
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    if (display.days)    display.days.textContent    = pad(d);
    if (display.hours)   display.hours.textContent   = pad(h);
    if (display.minutes) display.minutes.textContent = pad(m);
    if (display.seconds) display.seconds.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ── 6. Product Search & Filter ──────────────────────────── */
(function initProducts() {
  const searchInput = $('#product-search');
  const filterTabs  = $$('.filter-tab');
  const cards       = $$('.product-card[data-category]');
  const noResults   = $('#no-results');

  if (!searchInput && !filterTabs.length) return;

  let activeCategory = 'all';
  let searchQuery    = '';

  function filterCards() {
    let visible = 0;
    cards.forEach(card => {
      const cat  = card.dataset.category.toLowerCase();
      const name = card.dataset.name?.toLowerCase() || '';
      const matchCat  = activeCategory === 'all' || cat === activeCategory;
      const matchSearch = !searchQuery || name.includes(searchQuery);
      const show = matchCat && matchSearch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (noResults) noResults.classList.toggle('show', visible === 0);
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      filterCards();
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.filter;
      filterCards();
    });
  });
})();

/* ── 7. Contact Form ─────────────────────────────────────── */
(function initContactForm() {
  const form    = $('#contact-form');
  const success = $('#form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    // Simple validation
    const inputs = $$('input,textarea,select', form);
    let valid = true;
    inputs.forEach(inp => {
      if (inp.required && !inp.value.trim()) {
        inp.style.borderColor = '#EF4444';
        valid = false;
      } else {
        inp.style.borderColor = '';
      }
    });
    if (!valid) return;

    // Simulate submission
    form.style.display = 'none';
    if (success) success.classList.add('show');
  });
})();

/* ── 8. Newsletter Form ──────────────────────────────────── */
(function initNewsletter() {
  const form = $('#newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('input', form);
    if (input?.value) {
      input.value = '';
      input.placeholder = '✓ Subscribed! Thank you.';
      setTimeout(() => { input.placeholder = 'Your email address'; }, 3000);
    }
  });
})();

/* ── 9. Smooth page load ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .35s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});