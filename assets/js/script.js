/* =====================================================
   RALLY ACU — Premium JS v3.0
   Particle canvas · Staggered reveals · Spotlight
   Gallery · Lightbox · Counters · Theme · Search
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. THEME MANAGER ─────────────────────────────
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('rally-theme', theme);
  };

  // Load saved theme, default dark
  const savedTheme = localStorage.getItem('rally-theme') || 'dark';
  applyTheme(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });


  // ─── 2. NAV SCROLL EFFECT ────────────────────────
  const header = document.getElementById('main-header');
  const scrollProgress = document.getElementById('scroll-progress');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Scrolled class
    if (header) {
      header.classList.toggle('scrolled', scrollTop > 40);
    }

    // Progress bar
    if (scrollProgress) {
      scrollProgress.style.width = `${(scrollTop / docHeight) * 100}%`;
    }
  }, { passive: true });


  // ─── 3. MOBILE HAMBURGER ─────────────────────────
  const hamburger = document.getElementById('hamburger-menu');
  const navMenu = document.getElementById('nav-menu');

  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('active');
    navMenu?.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on nav link click
  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });


  // ─── 4. PARTICLE CANVAS ──────────────────────────
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 1.5 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.5 + 0.1;
        // Randomly pick color tint
        const tint = Math.random();
        if (tint < 0.5) this.color = `rgba(244,63,94,${this.alpha})`;
        else if (tint < 0.75) this.color = `rgba(56,189,248,${this.alpha})`;
        else this.color = `rgba(245,158,11,${this.alpha})`;
      }
      update() {
        // Base linear move
        this.x += this.vx;
        this.y += this.vy;

        // Mouse repulsion force field
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const forceRadius = 110;

          if (dist < forceRadius) {
            const force = (forceRadius - dist) / forceRadius; // 0 to 1
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 1.2;
            this.y += Math.sin(angle) * force * 1.2;
          }
        }

        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < 90; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };
    animate();
  }


  // ─── 5. SCROLL REVEAL ────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }


  // ─── 6. COUNT-UP ANIMATION ───────────────────────
  const statsSection = document.getElementById('impact');
  const countEls = document.querySelectorAll('.stat-number[data-target]');

  if (statsSection && countEls.length > 0) {
    let counted = false;

    const countUp = (el) => {
      const target = parseInt(el.dataset.target, 10);
      const isLarge = target >= 100;
      const duration = isLarge ? 1800 : 1200;
      const step = 16;
      const steps = duration / step;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current = Math.min(current + increment, target);
        el.textContent = Math.floor(current) + (target >= 100 ? '+' : (target >= 12 ? '+' : ''));
        if (current >= target) clearInterval(timer);
      }, step);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        countEls.forEach(el => countUp(el));
      }
    }, { threshold: 0.4 });

    counterObserver.observe(statsSection);
  }


  // ─── 7. SPOTLIGHT (MOUSE TRACKING) ───────────────
  const spotlightCards = document.querySelectorAll('.spotlight-card');
  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });


  // ─── 8. EVENT TAB NAVIGATION (SEASONS PAGE) ──────
  const tabBtns = document.querySelectorAll('.event-tab-btn');
  const tabPanels = document.querySelectorAll('.event-tab-panel');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.classList.add('active');
      });
    });
  }


  // ─── 9. GALLERY SLIDERS ──────────────────────────
  const galleryTracks = document.querySelectorAll('.gallery-track');

  galleryTracks.forEach(track => {
    const slides = track.querySelectorAll('.gallery-slide');
    const prevBtn = track.querySelector('.gallery-ctrl-prev');
    const nextBtn = track.querySelector('.gallery-ctrl-next');
    const indicator = track.querySelector('.gallery-indicator');
    const total = slides.length;
    let current = 0;

    const show = (idx) => {
      slides[current].classList.remove('active');
      const video = slides[current].querySelector('video');
      if (video) video.pause();

      current = (idx + total) % total;
      slides[current].classList.add('active');
      const newVid = slides[current].querySelector('video');
      if (newVid) newVid.play().catch(() => {});

      if (indicator) indicator.textContent = `${current + 1} / ${total}`;
    };

    prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); show(current - 1); });
    nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); show(current + 1); });
  });


  // ─── 10. LIGHTBOX ────────────────────────────────
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxMedia = document.getElementById('lightbox-media-container');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxMedia) {
    // Open on clicking slide content
    document.querySelectorAll('.gallery-slide img, .gallery-slide video').forEach(media => {
      media.style.cursor = 'zoom-in';
      media.addEventListener('click', () => {
        const clone = media.cloneNode(true);
        clone.removeAttribute('style');
        if (clone.tagName === 'VIDEO') {
          clone.setAttribute('controls', '');
          clone.removeAttribute('muted');
          clone.play().catch(() => {});
        }
        lightboxMedia.innerHTML = '';
        lightboxMedia.appendChild(clone);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightboxMedia.innerHTML = '';
      document.body.style.overflow = '';
    };

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }


  // ─── 11. TEAM SEARCH + FILTER ────────────────────
  const searchInput = document.getElementById('member-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const memberCards = document.querySelectorAll('.member-card');

  if (memberCards.length > 0) {
    let activeFilter = 'all';

    const applyFilters = () => {
      const query = (searchInput?.value || '').toLowerCase().trim();

      memberCards.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const matchesFilter = activeFilter === 'all' || card.classList.contains(activeFilter);
        const matchesSearch = name.includes(query);
        card.classList.toggle('hidden', !(matchesFilter && matchesSearch));
      });

      // Hide entire sections that have no visible cards
      document.querySelectorAll('.team-grid-section').forEach(section => {
        const visible = section.querySelectorAll('.member-card:not(.hidden)').length;
        section.style.display = visible === 0 ? 'none' : '';
      });
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    searchInput?.addEventListener('input', applyFilters);
  }

  // ─── 12. BACK TO TOP WITH SCROLL PROGRESS ─────────
  const bttBtn = document.getElementById('back-to-top');
  const bttProgress = document.getElementById('btt-progress-bar');
  const totalLength = 251.2; // 2 * Math.PI * 40

  if (bttBtn && bttProgress) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Show/hide button
      if (scrollTop > 300) {
        bttBtn.classList.add('visible');
      } else {
        bttBtn.classList.remove('visible');
      }

      // Update circular progress fill
      if (docHeight > 0) {
        const progress = scrollTop / docHeight;
        const offset = totalLength - (progress * totalLength);
        bttProgress.style.strokeDashoffset = offset;
      }
    }, { passive: true });

    bttBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── 13. FAQ ACCORDION ─────────────────────────────
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const panel = item.querySelector('.faq-answer-panel');

    // Initially hide panel heights explicitly on load for transition support
    if (panel) {
      panel.style.maxHeight = '0px';
    }

    btn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all first for standard accordion behavior
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherPanel = otherItem.querySelector('.faq-answer-panel');
        if (otherPanel) {
          otherPanel.style.maxHeight = '0px';
        }
        otherItem.querySelector('.faq-question-btn')?.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

});
