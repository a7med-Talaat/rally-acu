/* =====================================================
   RALLY ACU — Premium JS v3.0
   Particle canvas · Staggered reveals · Spotlight
   Gallery · Lightbox · Counters · Theme · Search
   ===================================================== */

// ─── 0. CLEAN URL MANAGER (Strips .html & index.html on live web) ────────
(function() {
  if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
    const path = window.location.pathname;
    let clean = path;

    // Convert /index.html -> /
    if (clean.endsWith('/index.html')) {
      clean = clean.slice(0, -10) || '/';
    } else if (clean === '/index.html' || clean === 'index.html') {
      clean = '/';
    } else if (clean.endsWith('.html')) {
      // Convert /page.html -> /page
      clean = clean.slice(0, -5);
    }

    if (clean !== path) {
      window.history.replaceState(null, document.title, clean + window.location.search + window.location.hash);
    }
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  // ─── 0.1 CLEAN INTERNAL LINKS ON LIVE WEB ─────────
  if (window.location.protocol.startsWith('http')) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

      if (href === 'index.html' || href === './index.html') {
        link.setAttribute('href', './');
      } else if (href.startsWith('index.html#')) {
        link.setAttribute('href', './' + href.substring(10));
      } else if (href.endsWith('.html')) {
        link.setAttribute('href', href.slice(0, -5));
      } else if (href.includes('.html#')) {
        link.setAttribute('href', href.replace('.html#', '#'));
      }
    });
  }


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

  // ─── 14. FESTIVAL SPEAKERS STAGE FILTER ────────────
  const speakerFilterBtns = document.querySelectorAll('.speaker-filter-btn');
  const speakerCards = document.querySelectorAll('.speaker-card[data-stage]');

  if (speakerFilterBtns.length > 0 && speakerCards.length > 0) {
    speakerFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        speakerFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.stageFilter || 'all';

        speakerCards.forEach(card => {
          if (filter === 'all' || card.dataset.stage === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

});

/* ══════════════════════════════════════════════════════
   AI EMAIL COMPOSER — Rally ACU Startup Pitch Tool
   Opens the user's own mail app pre-filled and ready.
   No external service. No API key. No backend.
══════════════════════════════════════════════════════ */
(function () {

  const RALLY_EMAIL = 'rallyahramcanadianuniversity@gmail.com';
  const TOTAL_STEPS = 6;

  const STEPS = [
    {
      question: "Hi there! 👋 I'm the Rally ACU Email Assistant. I'll help you write a professional pitch to our team in just a minute.\n\nFirst — what's your full name?",
      placeholder: 'e.g. Ahmed Talaat',
      type: 'text',
      key: 'name'
    },
    {
      question: "Great to meet you, {name}! 🚀\n\nWhat's your startup or idea called? (A working title is totally fine!)",
      placeholder: 'e.g. GreenBox, EduLink, my unnamed idea...',
      type: 'text',
      key: 'ideaName'
    },
    {
      question: "Love it! ✨ In one sentence — what problem does \"{ideaName}\" solve?",
      placeholder: 'e.g. It helps students find affordable textbooks by connecting them with seniors who finished their courses.',
      type: 'textarea',
      key: 'problem'
    },
    {
      question: "Almost there! 🎯 What kind of support are you looking for from Rally ACU? (Select all that apply)",
      type: 'chips',
      key: 'support',
      options: ['Mentorship', 'Pitching Support', 'Network Access', 'Expert Feedback', 'Funding Guidance', 'Partnership Opportunities']
    },
    {
      question: "📬 What's your email address so we can get back to you?",
      placeholder: 'your.email@example.com',
      type: 'email',
      key: 'contactEmail'
    },
    {
      question: "📱 Last one! What's your phone number? (So we can reach you quickly if needed — optional but helpful)",
      placeholder: 'e.g. +20 1xx xxx xxxx',
      type: 'text',
      key: 'contactPhone',
      optional: true
    }
  ];

  let answers = {};
  let currentStep = 0;
  let composerOpen = false;

  function interpolate(text) {
    return text
      .replace('{name}', answers.name || 'there')
      .replace('{ideaName}', answers.ideaName || 'my idea');
  }

  function generateEmailDraft() {
    const supportList = (answers.support || []).join(', ') || 'mentorship and guidance';
    const subject = `Startup Idea Submission — ${answers.ideaName || 'My Startup Idea'}`;
    const contactLine = [
      answers.contactEmail ? `Email: ${answers.contactEmail}` : '',
      answers.contactPhone ? `Phone: ${answers.contactPhone}` : ''
    ].filter(Boolean).join('  |  ') || 'Not provided';

    const body =
`Subject: ${subject}

Dear Rally ACU Team,

My name is ${answers.name || '[Your Name]'}, and I am a student at Ahram Canadian University.

I have a startup idea called "${answers.ideaName || '[Idea Name]'}." ${answers.problem || '[Problem statement]'}

I am reaching out because I would love to get ${supportList} from Rally ACU to help me develop this idea further. I believe Rally ACU's community, events, and expertise can make a real difference in turning this concept into something meaningful and impactful.

── Contact Details ──────────────────────────
${contactLine}
─────────────────────────────────────────────

I look forward to hearing from you and exploring how we can move forward together.

Best regards,
${answers.name || '[Your Name]'}`;
    return { subject, body };
  }

  // ─── DOM Helpers ──────────────────────────────────────
  function makeBubble(text, isUser = false) {
    const wrap = document.createElement('div');
    wrap.className = 'ai-bubble' + (isUser ? ' user-bubble' : '');

    const icon = document.createElement('div');
    icon.className = 'ai-bubble-icon';
    icon.textContent = isUser ? '👤' : '✨';

    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble-text';
    bubble.style.whiteSpace = 'pre-line';
    bubble.textContent = text;

    if (isUser) {
      wrap.appendChild(bubble);
      wrap.appendChild(icon);
    } else {
      wrap.appendChild(icon);
      wrap.appendChild(bubble);
    }
    return wrap;
  }

  function makeTypingIndicator() {
    const wrap = document.createElement('div');
    wrap.className = 'ai-typing-indicator';

    const icon = document.createElement('div');
    icon.className = 'ai-bubble-icon';
    icon.textContent = '✨';

    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';

    wrap.appendChild(icon);
    wrap.appendChild(dots);
    return wrap;
  }

  function scrollChatToBottom(chat) {
    setTimeout(() => { chat.scrollTop = chat.scrollHeight; }, 50);
  }

  // ─── Input Area ──────────────────────────────────────
  function renderInputArea(stepIndex) {
    const container = document.getElementById('ai-input-area');
    if (!container) return;
    container.innerHTML = '';
    container.className = 'ai-input-area';

    const step = STEPS[stepIndex];

    if (step.type === 'text' || step.type === 'email') {
      const input = document.createElement('input');
      input.type = step.type === 'email' ? 'email' : 'text';
      input.className = 'ai-step-text-input';
      input.placeholder = step.placeholder;
      input.setAttribute('autocomplete', step.type === 'email' ? 'email' : 'off');

      const isLast = stepIndex === TOTAL_STEPS - 1;
      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:8px;';

      const btn = document.createElement('button');
      btn.className = 'ai-next-btn';
      btn.textContent = isLast ? 'Generate My Email ✨' : 'Continue →';
      btn.disabled = !step.optional;
      btn.style.flex = '1';

      if (step.optional) {
        // Skip button for optional steps
        const skipBtn = document.createElement('button');
        skipBtn.className = 'ai-action-copy';
        skipBtn.textContent = 'Skip →';
        skipBtn.style.cssText = 'flex:0 0 auto;padding:11px 16px;border-radius:20px;font-size:0.9rem;font-weight:700;cursor:pointer;';
        skipBtn.addEventListener('click', () => submitAnswer(stepIndex, ''));
        btnRow.appendChild(skipBtn);
        btn.disabled = false; // allow submitting empty for optional
      }

      input.addEventListener('input', () => {
        if (!step.optional) btn.disabled = input.value.trim().length === 0;
      });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !btn.disabled) btn.click(); });

      btn.addEventListener('click', () => {
        const val = input.value.trim();
        if (!step.optional && !val) return;
        submitAnswer(stepIndex, val);
      });

      btnRow.appendChild(btn);
      container.appendChild(input);
      container.appendChild(btnRow);
      setTimeout(() => input.focus(), 100);

    } else if (step.type === 'textarea') {
      const ta = document.createElement('textarea');
      ta.className = 'ai-step-text-input';
      ta.placeholder = step.placeholder;
      ta.rows = 3;

      const btn = document.createElement('button');
      btn.className = 'ai-next-btn';
      btn.textContent = 'Continue →';
      btn.disabled = true;

      ta.addEventListener('input', () => { btn.disabled = ta.value.trim().length === 0; });

      btn.addEventListener('click', () => {
        const val = ta.value.trim();
        if (!val) return;
        submitAnswer(stepIndex, val);
      });

      container.appendChild(ta);
      container.appendChild(btn);
      setTimeout(() => ta.focus(), 100);

    } else if (step.type === 'chips') {
      const selectedItems = new Set();

      const chipsWrap = document.createElement('div');
      chipsWrap.className = 'ai-support-chips-wrap';

      step.options.forEach(opt => {
        const chip = document.createElement('button');
        chip.className = 'ai-support-chip';
        chip.textContent = opt;
        chip.type = 'button';
        chip.addEventListener('click', () => {
          if (selectedItems.has(opt)) {
            selectedItems.delete(opt);
            chip.classList.remove('selected');
          } else {
            selectedItems.add(opt);
            chip.classList.add('selected');
          }
          btn.disabled = selectedItems.size === 0;
        });
        chipsWrap.appendChild(chip);
      });

      const btn = document.createElement('button');
      btn.className = 'ai-next-btn';
      btn.textContent = 'Generate My Email ✨';
      btn.disabled = true;

      btn.addEventListener('click', () => {
        if (selectedItems.size === 0) return;
        submitAnswer(stepIndex, Array.from(selectedItems));
      });

      container.appendChild(chipsWrap);
      container.appendChild(btn);
    }
  }

  // ─── Submit + Advance ────────────────────────────────
  function submitAnswer(stepIndex, value) {
    const step = STEPS[stepIndex];
    answers[step.key] = value;

    const chat = document.getElementById('ai-chat');
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    chat.appendChild(makeBubble(displayValue, true));
    scrollChatToBottom(chat);

    // Clear input area
    const inputArea = document.getElementById('ai-input-area');
    if (inputArea) inputArea.innerHTML = '';

    // Update progress
    currentStep = stepIndex + 1;
    updateProgress();

    if (currentStep >= TOTAL_STEPS) {
      // Final step → show preview
      setTimeout(() => showPreview(chat), 700);
    } else {
      // Show typing then next question
      const typing = makeTypingIndicator();
      chat.appendChild(typing);
      scrollChatToBottom(chat);

      setTimeout(() => {
        chat.removeChild(typing);
        const nextStep = STEPS[currentStep];
        chat.appendChild(makeBubble(interpolate(nextStep.question)));
        scrollChatToBottom(chat);
        renderInputArea(currentStep);
      }, 900);
    }
  }

  function showPreview(chat) {
    const typing = makeTypingIndicator();
    chat.appendChild(typing);
    scrollChatToBottom(chat);

    setTimeout(() => {
      chat.removeChild(typing);
      chat.appendChild(makeBubble("Perfect! 🎉 Here's your personalized pitch email. Feel free to edit it before sending!"));
      scrollChatToBottom(chat);

      const { subject, body } = generateEmailDraft();

      const inputArea = document.getElementById('ai-input-area');
      if (!inputArea) return;
      inputArea.innerHTML = '';
      inputArea.className = 'ai-input-area';

      const ta = document.createElement('textarea');
      ta.className = 'ai-preview-textarea';
      ta.value = body;
      ta.rows = 12;

      // ── Status message (hidden by default) ──────────
      const statusMsg = document.createElement('div');
      statusMsg.style.cssText = `
        font-size: 0.85rem;
        font-weight: 600;
        text-align: center;
        padding: 8px 12px;
        border-radius: 10px;
        margin-bottom: 8px;
        display: none;
      `;

      const actionsWrap = document.createElement('div');
      actionsWrap.className = 'ai-preview-actions';

      // ── Copy button ──────────────────────────────────
      const copyBtn = document.createElement('button');
      copyBtn.className = 'ai-action-copy';
      copyBtn.innerHTML = '📋 Copy';

      // ── Send via Mail App (primary action) ───────────
      const mailBtn = document.createElement('button');
      mailBtn.className = 'ai-action-send';
      mailBtn.innerHTML = '📧 Send Email';

      // Copy handler
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(ta.value).then(() => {
          copyBtn.innerHTML = '✅ Copied!';
          setTimeout(() => { copyBtn.innerHTML = '📋 Copy'; }, 2500);
        }).catch(() => {
          ta.select();
          document.execCommand('copy');
          copyBtn.innerHTML = '✅ Copied!';
          setTimeout(() => { copyBtn.innerHTML = '📋 Copy'; }, 2500);
        });
      });

      // Mail handler — opens Gmail compose in new tab, pre-filled and ready to Send
      mailBtn.addEventListener('click', () => {
        const emailBody = ta.value.replace(/^Subject:[^\n]*\n\n/, '');
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(RALLY_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(gmailUrl, '_blank');

        mailBtn.innerHTML = '✅ Opened!';
        setTimeout(() => { mailBtn.innerHTML = '📧 Send Email'; }, 3000);

        const successBubble = makeBubble("Gmail just opened in a new tab! 📬 Your pitch is ready — just hit Send. Good luck — we're rooting for you! 🚀");
        chat.appendChild(successBubble);
        scrollChatToBottom(chat);
      });

      actionsWrap.appendChild(copyBtn);
      actionsWrap.appendChild(mailBtn);

      inputArea.appendChild(ta);
      inputArea.appendChild(actionsWrap);

      scrollChatToBottom(chat);
    }, 1000);
  }


  function updateProgress() {
    const fill = document.getElementById('ai-progress-fill');
    const label = document.getElementById('ai-step-label');
    if (fill) fill.style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
    if (label) {
      label.textContent = currentStep >= TOTAL_STEPS
        ? 'Email ready!'
        : `Step ${currentStep + 1} of ${TOTAL_STEPS}`;
    }
  }

  // ─── Open / Close Modal ──────────────────────────────
  function openComposer() {
    const overlay = document.getElementById('ai-composer-overlay');
    if (!overlay) return;

    // Reset state
    answers = {};
    currentStep = 0;

    // Clear chat
    const chat = document.getElementById('ai-chat');
    if (chat) chat.innerHTML = '';

    // Reset progress
    updateProgress();

    // Show first message
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    composerOpen = true;

    setTimeout(() => {
      const typing = makeTypingIndicator();
      chat.appendChild(typing);
      scrollChatToBottom(chat);

      setTimeout(() => {
        chat.removeChild(typing);
        chat.appendChild(makeBubble(STEPS[0].question));
        scrollChatToBottom(chat);
        renderInputArea(0);
        updateProgress();
      }, 800);
    }, 200);
  }

  function closeComposer() {
    const overlay = document.getElementById('ai-composer-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    composerOpen = false;
  }

  // ─── Init ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const triggerBtns = document.querySelectorAll('.trigger-ai-composer, #open-ai-composer');
    const closeBtn = document.getElementById('ai-composer-close');
    const overlay = document.getElementById('ai-composer-overlay');

    triggerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openComposer();
      });
    });
    if (closeBtn) closeBtn.addEventListener('click', closeComposer);

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeComposer();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && composerOpen) closeComposer();
    });

    // Init progress bar width at 0
    const fill = document.getElementById('ai-progress-fill');
    if (fill) fill.style.width = '0%';
  });
})();
