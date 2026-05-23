/* ==========================================================================
   INTERACTIVE LOGIC & ENGAGEMENT SCRIPT - ASSEMBLE: AGENTIC AI
   ========================================================================== */

function initAll() {
  // Initialize all interactive modules
  initCountdown();
  initStickyCTA();
  initExitIntent();
  initAccordions();
  initFormHandler();
  initAnalyticsTracking();
  initProgressBar();
  // MotionSites.ai Signature Effects
  initTextRevealObserver();
  initScrollDrawAndHighlight();
  initStarPopObserver();
  initMagneticButtons();
  initSpotlightHover();
  // Custom Modules (Phase 3)
  initCurriculumTabs();
  initExitIntentForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

/* ==========================================================================
   COUNTDOWN TIMER (June 19, 2026, at 08:30 — Day 1 of 3-day workshop)
   ========================================================================== */
function initCountdown() {
  // June 19, 2026 at 08:30:00 GMT+7 (which is 01:30:00 UTC)
  const targetDate = Date.UTC(2026, 5, 19, 1, 30, 0);
  
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');
  
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
  
  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) {
      clearInterval(timerInterval);
      const container = document.querySelector('.countdown-container');
      if (container) {
        container.innerHTML = 
          '<div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-secondary)">WORKSHOP ĐANG DIỄN RA</div>';
      }
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }
  
  updateTimer(); // run once immediately
  const timerInterval = setInterval(updateTimer, 1000);
}

/* ==========================================================================
   STICKY CTA BAR TRIGGER
   ========================================================================== */
function initStickyCTA() {
  const stickyBar = document.getElementById('sticky-cta-bar');
  const finalFormSection = document.getElementById('final-register-section');
  
  if (!stickyBar) return;
  
  let hasPassedHero = false;
  let isViewingForm = false;
  
  // 1. Detect scroll past 100vh (Hero view)
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    
    hasPassedHero = scrollY > (viewportHeight * 0.85);
    updateStickyVisibility();
  });
  
  // 2. Detect if Form is in Viewport using Intersection Observer
  if (finalFormSection) {
    const formObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isViewingForm = entry.isIntersecting;
        updateStickyVisibility();
      });
    }, {
      root: null,
      threshold: 0.05 // Hide CTA as soon as top 5% of form section enters screen
    });
    
    formObserver.observe(finalFormSection);
  }
  
  function updateStickyVisibility() {
    if (hasPassedHero && !isViewingForm) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  }
}

/* ==========================================================================
   EXIT INTENT POPUP & IDLE TIMER
   ========================================================================== */
/* ==========================================================================
   MODAL ACCESSIBILITY HELPERS (WCAG 2.2 AA)
   ========================================================================== */
let activeFocusTrap = null;

function trapFocus(modal, e) {
  if (e.key !== 'Tab') return;

  const focusableEls = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusableEls.length === 0) return;
  
  const firstFocusable = focusableEls[0];
  const lastFocusable = focusableEls[focusableEls.length - 1];

  if (e.shiftKey) { // Shift + Tab
    if (document.activeElement === firstFocusable) {
      lastFocusable.focus();
      e.preventDefault();
    }
  } else { // Tab
    if (document.activeElement === lastFocusable) {
      firstFocusable.focus();
      e.preventDefault();
    }
  }
}

function openModal(modal) {
  const previouslyFocused = document.activeElement;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  
  // Focus first interactive element
  const focusableEls = modal.querySelectorAll('button, [href], input, select, textarea');
  if (focusableEls.length > 0) {
    focusableEls[0].focus();
  } else {
    modal.focus();
  }

  activeFocusTrap = (e) => {
    trapFocus(modal, e);
    if (e.key === 'Escape') {
      closeModal(modal, previouslyFocused);
    }
  };
  window.addEventListener('keydown', activeFocusTrap);
  return previouslyFocused;
}

function closeModal(modal, restoreEl) {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');

  if (activeFocusTrap) {
    window.removeEventListener('keydown', activeFocusTrap);
    activeFocusTrap = null;
  }

  if (restoreEl && typeof restoreEl.focus === 'function') {
    restoreEl.focus();
  }
}

/* ==========================================================================
   EXIT INTENT POPUP & IDLE TIMER
   ========================================================================== */
function initExitIntent() {
  const exitModal = document.getElementById('exit-intent-modal');
  const closeBtn = document.getElementById('exit-modal-close');
  const consultBtn = document.getElementById('exit-modal-consult');
  
  if (!exitModal) return;
  
  let popupShown = false;
  let triggerElement = null;
  
  // Helper to open popup
  function showPopup() {
    if (popupShown) return;
    popupShown = true;
    triggerElement = openModal(exitModal);
    logGA4Event('view_exit_intent', { triggered_by: 'intent' });
  }
  
  // Helper to close popup
  function hidePopup() {
    closeModal(exitModal, triggerElement);
  }
  
  // Close triggers
  if (closeBtn) closeBtn.addEventListener('click', hidePopup);
  exitModal.addEventListener('click', (e) => {
    if (e.target === exitModal) hidePopup();
  });
  
  // Redirect and scroll to Form
  if (consultBtn) {
    consultBtn.addEventListener('click', () => {
      hidePopup();
      const formSection = document.getElementById('final-register-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
        // Set dynamic focus to persona select or name input
        const nameInput = document.getElementById('form-name');
        if (nameInput) nameInput.focus();
      }
      logGA4Event('cta_click', { cta_position: 'exit_intent', cta_text: consultBtn.textContent.trim() });
    });
  }
  
  // 1. Mouseleave detector (Desktop)
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 20) { // mouse moved up near browser tab bar
      showPopup();
    }
  });
  
  // 2. Rapid Scroll Up detector (Mobile)
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const currentTime = Date.now();
    const diffY = lastScrollY - currentScrollY; // positive if scrolling UP
    const diffTime = currentTime - lastScrollTime;
    
    if (diffY > 150 && diffTime < 100 && currentScrollY > 300) {
      showPopup(); // fast scroll up triggers exit intent
    }
    
    lastScrollY = currentScrollY;
    lastScrollTime = currentTime;
  });
  
  // 3. Idle 45 seconds detector
  let idleTimer;
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      showPopup();
    }, 45000); // 45 seconds
  }
  
  // Events that reset the idle timer
  const idleEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  idleEvents.forEach(evt => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
  });
  resetIdleTimer();
}

/* ==========================================================================
   INTERACTIVE ACCORDIONS (Objections & FAQ)
   ========================================================================== */
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all other accordion items in the same container
      const container = item.parentElement;
      const siblingItems = container.querySelectorAll('.accordion-item');
      siblingItems.forEach(sibling => {
        sibling.classList.remove('active');
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        logGA4Event('click_accordion', { title: header.querySelector('h4').textContent.trim() });
      }
    });
  });
}

/* ==========================================================================
   DYNAMIC FORM HANDLER & LEAD CAPTURE
   ========================================================================== */
function validateField(input) {
  const group = input.closest('.form-group');
  if (!group) return true;
  const errorEl = group.querySelector('.field-error');
  if (!errorEl) return true;

  let isValid = true;
  let errorMsg = '';

  if (input.required && !input.value.trim()) {
    isValid = false;
    errorMsg = 'Trường này không được để trống.';
  } else if (input.type === 'email' && input.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value.trim())) {
      isValid = false;
      errorMsg = 'Địa chỉ email không đúng định dạng (Ví dụ: name@company.com).';
    }
  } else if ((input.id === 'form-phone' || input.id === 'exit-form-phone') && input.value.trim()) {
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phoneRegex.test(input.value.replace(/\s+/g, ''))) {
      isValid = false;
      errorMsg = 'Số điện thoại không hợp lệ (Phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08, hoặc 09).';
    }
  } else if ((input.id === 'form-name' || input.id === 'exit-form-name') && input.value.trim()) {
    if (input.value.trim().split(/\s+/).length < 2) {
      isValid = false;
      errorMsg = 'Vui lòng nhập đầy đủ cả họ và tên (tối thiểu 2 từ).';
    }
  }

  if (!isValid) {
    input.classList.add('invalid');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorEl.id);
    errorEl.textContent = errorMsg;
    errorEl.classList.add('visible');
  } else {
    input.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }

  return isValid;
}

function initFormHandler() {
  const form = document.getElementById('lead-register-form');
  const thankYouModal = document.getElementById('thank-you-modal');
  const thankYouClose = document.getElementById('thank-you-close');
  
  if (!form) return;
  
  // Focus tracking & Real-time validation (inputs only, select lists removed)
  const formInputs = form.querySelectorAll('input');
  let formStarted = false;
  let triggerElement = null;

  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      if (!formStarted) {
        formStarted = true;
        logGA4Event('form_start', { form_id: 'lead_registration_form_v1', first_field_focused: input.id || input.name });
      }
    });

    // Real-time checking on blur and input
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) {
        validateField(input);
      }
    });
  });
  
  // Close thank you modal
  if (thankYouClose) {
    thankYouClose.addEventListener('click', () => {
      closeModal(thankYouModal, triggerElement);
    });
  }
  thankYouModal.addEventListener('click', (e) => {
    if (e.target === thankYouModal) {
      closeModal(thankYouModal, triggerElement);
    }
  });

  // Track lead magnet download
  const downloadChecklistBtn = document.getElementById('download-checklist-btn');
  if (downloadChecklistBtn) {
    downloadChecklistBtn.addEventListener('click', () => {
      logGA4Event('download_lead_magnet', { checklist_version: 'v1.0' });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isFormValid = true;
    let firstInvalidInput = null;

    formInputs.forEach(input => {
      const isFieldValid = validateField(input);
      if (!isFieldValid) {
        isFormValid = false;
        if (!firstInvalidInput) {
          firstInvalidInput = input;
        }
      }
    });

    if (!isFormValid) {
      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }
      return;
    }
    
    // Read input values
    const nameVal = document.getElementById('form-name').value.trim();
    const emailVal = document.getElementById('form-email').value.trim();
    const phoneVal = document.getElementById('form-phone').value.trim();
    
    // Save locally
    const leadData = {
      name: nameVal,
      email: emailVal,
      phone: phoneVal,
      submittedAt: new Date().toISOString()
    };
    
    localStorage.setItem('assemble_lead_data', JSON.stringify(leadData));
    
    // Analytics Log
    logGA4Event('form_submit_success', {
      form_id: 'lead_registration_form_v1'
    });
    
    // Open thank-you modal with focus trap
    if (thankYouModal) {
      triggerElement = openModal(thankYouModal);
    }
    
    // Reset Form
    form.reset();
    formInputs.forEach(input => {
      input.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    });
  });
}

/* ==========================================================================
   GA4 INTERSECTION OBSERVER SCROLL DEPTH & MAP LOGGING
   ========================================================================== */
function initAnalyticsTracking() {
  // Cấu hình Intersection Observer cho các Section mốc quan trọng
  const trackSections = [
    { id: 'story-section', eventName: 'view_story' },
    { id: 'output-section', eventName: 'view_output' },
    { id: 'offer-section', eventName: 'view_offer' },
    { id: 'faq-section', eventName: 'view_faq' }
  ];
  
  const observerOptions = {
    root: null,
    threshold: 0.3 // Kích hoạt khi section hiển thị 30% trong viewport
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const match = trackSections.find(s => s.id === entry.target.id);
        if (match) {
          logGA4Event(match.eventName, {
            'event_category': 'Engagement',
            'event_label': match.id
          });
          // Ngừng quan sát section này sau khi đã bắn event 1 lần
          observer.unobserve(entry.target);
        }
      }
    });
  }, observerOptions);
  
  // Gắn observer vào các thẻ DOM tương ứng
  trackSections.forEach(s => {
    const element = document.getElementById(s.id);
    if (element) observer.observe(element);
  });
  
  // Map and Venue View Event Logging
  const venueSection = document.getElementById('logistics-venue-section');
  if (venueSection) {
    const venueObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          logGA4Event('view_venue_details', {
            section: 'logistics_venue',
            venue_address: '93/16 Xo Viet Nghe Tinh, Gia Dinh, HCM'
          });
          venueObserver.unobserve(venueSection);
        }
      });
    }, { threshold: 0.2 });
    
    venueObserver.observe(venueSection);
  }
  
  // Map Link click logs
  const mapLinks = document.querySelectorAll('.map-link');
  mapLinks.forEach(link => {
    link.addEventListener('click', () => {
      logGA4Event('click_map_link', {
        target_url: link.href
      });
    });
  });
  
  // CTA Button click loggers (across sections)
  const ctaButtons = document.querySelectorAll('a.btn, button.btn');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Exclude form submission itself or close button
      if (btn.type === 'submit' || btn.classList.contains('modal-close-btn')) return;
      
      let pos = 'unknown';
      const section = btn.closest('section');
      if (section) {
        pos = section.id || section.className;
      } else if (btn.closest('#sticky-cta-bar')) {
        pos = 'sticky_bar';
      }
      
      logGA4Event('cta_click', {
        cta_position: pos,
        cta_text: btn.textContent.trim()
      });
    });
  });
}

// Helper function to log events to Console & gtag
function logGA4Event(eventName, properties) {
  console.log(`[GA4 Tracking Event: ${eventName}]`, properties);
  if (typeof gtag === 'function') {
    gtag('event', eventName, properties);
  }
}

/* ==========================================================================
   PROGRESS BAR — data-driven from data-registered / data-total attributes
   To update: change data-registered on #scarcity-bar in the HTML.
   ========================================================================== */
function initProgressBar() {
  const bar = document.getElementById('scarcity-bar');
  const fill = document.getElementById('progress-bar-fill');
  const labelRegistered = document.getElementById('progress-label-registered');
  const labelRemaining = document.getElementById('progress-label-remaining');
  const formScarcity = document.getElementById('form-scarcity-text');

  if (!bar || !fill) return;

  const registered = parseInt(bar.dataset.registered, 10) || 0;
  const total = parseInt(bar.dataset.total, 10) || 15;
  const remaining = Math.max(0, total - registered);
  const pct = Math.min(100, Math.round((registered / total) * 100));

  fill.style.width = pct + '%';

  if (labelRegistered) labelRegistered.textContent = `Đã đăng ký: ${registered}/${total} chỗ`;
  if (labelRemaining)  labelRemaining.textContent  = `Còn trống: ${remaining} chỗ`;
  if (formScarcity)    formScarcity.textContent     = `Chỉ còn ${remaining}/${total} chỗ trống của đợt này`;
}

/* ==========================================================================
   MOTIONSITES.AI — INTERACTIVE EFFECTS
   ========================================================================== */

/* Split Text Reveal — word-by-word fade-up on scroll */
function initTextRevealObserver() {
  const targets = document.querySelectorAll('.reveal-text');
  targets.forEach(target => {
    const words = target.textContent.trim().split(/\s+/);
    target.innerHTML = words.map((word, idx) =>
      `<span style="transition-delay: ${idx * 0.06}s">${word}&nbsp;</span>`
    ).join('');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          target.classList.add('visible');
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(target);
  });
}

/* Connector Line Draw + Quote Highlight Sweep on scroll */
function initScrollDrawAndHighlight() {
  // Connector lines
  const connectors = document.querySelectorAll('.connector-line');
  const connectorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        connectorObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  connectors.forEach(c => connectorObserver.observe(c));

  // Sweep highlights
  const highlights = document.querySelectorAll('.quote-highlight');
  const highlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        highlightObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  highlights.forEach(h => highlightObserver.observe(h));
}

/* Star Rating Pop — stars pop in sequentially when visible */
function initStarPopObserver() {
  const ratings = document.querySelectorAll('.testimonial-rating');
  const ratingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stars = entry.target.querySelectorAll('.star');
        stars.forEach((star, i) => {
          setTimeout(() => star.classList.add('pop'), i * 120);
        });
        ratingObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  ratings.forEach(r => ratingObserver.observe(r));
}

/* Magnetic CTA Buttons — button subtly follows cursor */
function initMagneticButtons() {
  const btns = document.querySelectorAll('.btn-cta');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      if (Math.abs(dx) < 80 && Math.abs(dy) < 80) {
        btn.style.transform = `translate(${dx * 0.2}px, ${dy * 0.2}px)`;
        btn.style.transition = 'transform 0.1s ease';
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });
}

/* Spotlight Hover for Pricing Cards */
function initSpotlightHover() {
  const cards = document.querySelectorAll('.offer-core-offer, .anchor-table, .early-bird-exclusive');
  cards.forEach(card => {
    card.classList.add('pricing-card-spotlight');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--x', `${x}%`);
      card.style.setProperty('--y', `${y}%`);
    });
  });
}

/* ==========================================================================
   ADDED MODULES (PHASE 3)
   ========================================================================== */

/* Curriculum Tabs Nav Toggler */
function initCurriculumTabs() {
  const tabs = document.querySelectorAll('.curriculum-tab-btn');
  const panels = document.querySelectorAll('.curriculum-tab-content');
  if (tabs.length === 0 || panels.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs & panels
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      // Add active to current tab
      tab.classList.add('active');
      const targetId = `day-${tab.dataset.day}-content`;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      logGA4Event('click_curriculum_tab', { day: tab.dataset.day });
    });
  });
}

/* Exit Intent Popup Form Handler */
function initExitIntentForm() {
  const exitForm = document.getElementById('exit-intent-form');
  const exitModal = document.getElementById('exit-intent-modal');
  const thankYouModal = document.getElementById('thank-you-modal');
  
  if (!exitForm) return;

  const exitInputs = exitForm.querySelectorAll('input');

  exitInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) {
        validateField(input);
      }
    });
  });

  exitForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;
    let firstInvalidInput = null;

    exitInputs.forEach(input => {
      const isFieldValid = validateField(input);
      if (!isFieldValid) {
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = input;
      }
    });

    if (!isFormValid) {
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }

    const nameVal = document.getElementById('exit-form-name').value.trim();
    const emailVal = document.getElementById('exit-form-email').value.trim();
    const phoneVal = document.getElementById('exit-form-phone').value.trim();

    const leadData = {
      name: nameVal,
      email: emailVal,
      phone: phoneVal,
      source: 'exit_intent',
      submittedAt: new Date().toISOString()
    };

    localStorage.setItem('assemble_lead_data_exit', JSON.stringify(leadData));
    logGA4Event('exit_intent_form_submit_success', {
      form_id: 'exit_intent_form_v1'
    });

    // Close exit modal, open success thank you modal
    closeModal(exitModal, null);
    openModal(thankYouModal);

    // Reset exit form
    exitForm.reset();
    exitInputs.forEach(input => {
      input.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    });
  });
}

