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
   Uses Brevo (brevo.com) — FREE 300 emails/day, forever.
   No monthly cap. No credit card required.
══════════════════════════════════════════════════════ */
(function () {

  // ─── Brevo Config ──────────────────────────────────
  // 1. Sign up FREE at https://brevo.com (no credit card)
  // 2. Go to: Settings → SMTP & API → API Keys → Generate
  // 3. Paste your API key below:
  const BREVO_API_KEY = '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';

  const RALLY_EMAIL   = 'rallyahramcanadianuniversity@gmail.com';
  const SENDER_NAME   = 'Rally ACU · Startup Portal';
  const TOTAL_STEPS   = 6;

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

      // ── Open in Mail App button (fixed) ─────────────
      const mailBtn = document.createElement('button');
      mailBtn.className = 'ai-action-copy';
      mailBtn.style.flex = '1';
      mailBtn.innerHTML = '📧 Mail App';

      // ── Send it Now button ───────────────────────────
      const sendNowBtn = document.createElement('button');
      sendNowBtn.className = 'ai-action-send';
      sendNowBtn.innerHTML = '🚀 Send it Now';

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

      // Open in Mail App handler (uses temp anchor to avoid page navigation)
      mailBtn.addEventListener('click', () => {
        const emailBody = ta.value.replace(/^Subject:[^\n]*\n\n/, '');
        const mailtoLink = `mailto:${RALLY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        const anchor = document.createElement('a');
        anchor.href = mailtoLink;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      });

      // Send it Now handler — Brevo (300 emails/day, free forever)
      sendNowBtn.addEventListener('click', () => {
        sendNowBtn.disabled = true;
        sendNowBtn.innerHTML = '⏳ Sending...';

        const emailBody = ta.value.replace(/^Subject:[^\n]*\n\n/, '');
        const supportList  = Array.isArray(answers.support) ? answers.support.join(', ') : (answers.support || '—');
        const contactEmail = answers.contactEmail || '—';
        const contactPhone = answers.contactPhone || '—';
        const studentName  = answers.name     || 'A Student';
        const ideaName     = answers.ideaName || '—';
        const problem      = answers.problem  || '—';

        // Guard: warn if API key is still a placeholder
        if (BREVO_API_KEY === 'YOUR_BREVO_API_KEY') {
          sendNowBtn.disabled = false;
          sendNowBtn.innerHTML = '🚀 Send it Now';
          statusMsg.style.display = 'block';
          statusMsg.style.background = 'rgba(245,158,11,0.1)';
          statusMsg.style.border = '1px solid rgba(245,158,11,0.3)';
          statusMsg.style.color = 'var(--gold)';
          statusMsg.textContent = '⚙️ Brevo API key is not set yet. Paste your key into script.js (takes 2 minutes at brevo.com — free!).';
          return;
        }

        // Branded HTML email template
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f8;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#f43f5e 0%,#e11d48 50%,#f59e0b 100%);padding:36px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.75);">Rally ACU · Startup Pitch Portal</p>
          <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">🚀 New Startup Idea Submission</h1>
          <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Someone has a great idea — let's take a look!</p>
        </td>
      </tr>

      <!-- Idea Summary Cards -->
      <tr>
        <td style="padding:32px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding-right:8px;vertical-align:top;">
                <div style="background:#fef3c7;border-radius:12px;padding:18px;border-left:4px solid #f59e0b;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#92400e;">Student Name</p>
                  <p style="margin:0;font-size:16px;font-weight:800;color:#1e293b;">${studentName}</p>
                </div>
              </td>
              <td width="50%" style="padding-left:8px;vertical-align:top;">
                <div style="background:#ffe4e6;border-radius:12px;padding:18px;border-left:4px solid #f43f5e;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9f1239;">Startup / Idea</p>
                  <p style="margin:0;font-size:16px;font-weight:800;color:#1e293b;">${ideaName}</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Contact Details -->
      <tr>
        <td style="padding:20px 40px 0;">
          <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">📬 Contact Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#64748b;font-weight:600;width:90px;">Email</td>
                <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:700;">
                  ${contactEmail !== '—' ? `<a href="mailto:${contactEmail}" style="color:#f43f5e;text-decoration:none;">${contactEmail}</a>` : '—'}
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#64748b;font-weight:600;">Phone</td>
                <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:700;">
                  ${contactPhone !== '—' ? `<a href="tel:${contactPhone}" style="color:#f43f5e;text-decoration:none;">${contactPhone}</a>` : '—'}
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>

      <!-- Problem + Support -->
      <tr>
        <td style="padding:20px 40px 0;">
          <div style="background:#f0fdf4;border-radius:12px;padding:20px;border-left:4px solid #22c55e;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#15803d;">🔍 Problem Being Solved</p>
            <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.7;">${problem}</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 40px 0;">
          <div style="background:#eff6ff;border-radius:12px;padding:20px;border-left:4px solid #3b82f6;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#1d4ed8;">🤝 Support Requested</p>
            <p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">${supportList}</p>
          </div>
        </td>
      </tr>

      <!-- Full Pitch -->
      <tr>
        <td style="padding:20px 40px 0;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">📄 Full Pitch Message</p>
          <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;">
            <p style="margin:0;font-size:14px;color:#334155;line-height:1.75;white-space:pre-line;">${emailBody}</p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:28px 40px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">Sent via <strong style="color:#f43f5e;">Rally ACU Startup Pitch Portal</strong> · <a href="https://rallyacu.qd.je" style="color:#f59e0b;text-decoration:none;">rallyacu.qd.je</a></p>
          <p style="margin:6px 0 0;font-size:11px;color:#cbd5e1;">Driven by speed, defined by impact ⚡</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

        const payload = {
          sender:  { name: SENDER_NAME, email: RALLY_EMAIL },
          to:      [{ email: RALLY_EMAIL, name: 'Rally ACU Team' }],
          replyTo: contactEmail !== '—' ? { email: contactEmail, name: studentName } : undefined,
          subject: `🚀 Startup Idea: ${ideaName} — by ${studentName}`,
          htmlContent
        };

        fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY
          },
          body: JSON.stringify(payload)
        })
        .then(res => {
          if (!res.ok) throw new Error('Brevo API error: ' + res.status);
          return res.json();
        })
        .then(() => {
          sendNowBtn.innerHTML = '✅ Sent!';
          statusMsg.style.display = 'block';
          statusMsg.style.background = 'rgba(34,197,94,0.12)';
          statusMsg.style.border = '1px solid rgba(34,197,94,0.3)';
          statusMsg.style.color = '#22c55e';
          statusMsg.textContent = "🎉 Your pitch was delivered to Rally ACU! We'll review it and get back to you soon.";
          const successBubble = makeBubble("Your email was sent! 🎉 Rally ACU will review your startup idea and reach out to you. Good luck — we're rooting for you! 🚀");
          chat.appendChild(successBubble);
          scrollChatToBottom(chat);
        })
        .catch(() => {
          sendNowBtn.disabled = false;
          sendNowBtn.innerHTML = '🚀 Send it Now';
          statusMsg.style.display = 'block';
          statusMsg.style.background = 'rgba(239,68,68,0.1)';
          statusMsg.style.border = '1px solid rgba(239,68,68,0.25)';
          statusMsg.style.color = 'var(--red)';
          statusMsg.textContent = '⚠️ Could not send right now. Please use "📧 Mail App" or copy and send manually to rallyahramcanadianuniversity@gmail.com';
        });
      });

      actionsWrap.appendChild(copyBtn);
      actionsWrap.appendChild(mailBtn);
      actionsWrap.appendChild(sendNowBtn);

      inputArea.appendChild(ta);
      inputArea.appendChild(statusMsg);
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
    const openBtn = document.getElementById('open-ai-composer');
    const closeBtn = document.getElementById('ai-composer-close');
    const overlay = document.getElementById('ai-composer-overlay');

    if (openBtn) openBtn.addEventListener('click', openComposer);
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
