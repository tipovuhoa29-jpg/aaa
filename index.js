// Curriculum tabs
    document.querySelectorAll('.curriculum-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const day = tab.dataset.day;

        document.querySelectorAll('.curriculum-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.curriculum-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById('day-' + day).classList.add('active');
      });
    });

    // Countdown JS
    const countdownTarget = new Date('2026-06-10T23:59:00+07:00').getTime();

    function tickCountdown() {
      const diff = countdownTarget - Date.now();
      if (diff <= 0) {
        const grid = document.querySelector('.countdown-grid');
        const ended = document.querySelector('.countdown-ended');
        if (grid) grid.style.display = 'none';
        if (ended) ended.style.display = 'block';
        return;
      }
      
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      const daysEl = document.getElementById('cd-days');
      const hoursEl = document.getElementById('cd-hours');
      const minsEl = document.getElementById('cd-mins');
      const secsEl = document.getElementById('cd-secs');

      function updateDigit(el, val) {
        if (!el) return;
        const targetStr = String(val).padStart(2, '0');
        if (el.textContent !== targetStr) {
          el.classList.add('flip');
          el.textContent = targetStr;
          setTimeout(() => el.classList.remove('flip'), 150);
        }
      }

      updateDigit(daysEl, d);
      updateDigit(hoursEl, h);
      updateDigit(minsEl, m);
      updateDigit(secsEl, s);
    }
    // Sticky CTA Bar JS
    const bar = document.getElementById('sticky-bar');
    const ctaForm = document.getElementById('final-cta');

    if (bar && ctaForm) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          bar.classList.remove('show');
        }
      }, { threshold: 0.1 });
      
      observer.observe(ctaForm);

      window.addEventListener('scroll', () => {
        if (window.innerWidth > 768) {
          const header = document.querySelector('header');
          const headerH = header ? header.offsetHeight : 60;
          const pastHeader = window.scrollY > headerH;
          bar.style.top = pastHeader ? '0' : headerH + 'px';
        } else {
          bar.style.top = '';
        }

        const rect = ctaForm.getBoundingClientRect();
        const isFormVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (window.scrollY > 400 && !isFormVisible) {
          bar.classList.add('show');
        } else {
          bar.classList.remove('show');
        }
      });
    }

    // Registration Form Validation & Submit
    const regForm = document.getElementById('reg-form');
    const thankYouMsg = document.getElementById('thank-you-message');

    if (regForm && thankYouMsg) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('reg-name');
        const emailInput = document.getElementById('reg-email');
        const phoneInput = document.getElementById('reg-phone');

        let isValid = true;

        // Reset errors
        [nameInput, emailInput, phoneInput].forEach(input => {
          if (input) {
            input.classList.remove('input-invalid');
            const errorEl = input.nextElementSibling;
            if (errorEl && errorEl.classList.contains('field-error')) {
              errorEl.style.display = 'none';
            }
          }
        });

        // Validate Name
        if (nameInput && !nameInput.value.trim()) {
          nameInput.classList.add('input-invalid');
          const err = document.getElementById('error-name');
          if (err) err.style.display = 'block';
          isValid = false;
        }

        // Validate Email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput && !emailPattern.test(emailInput.value.trim())) {
          emailInput.classList.add('input-invalid');
          const err = document.getElementById('error-email');
          if (err) err.style.display = 'block';
          isValid = false;
        }

        // Validate Phone
        if (phoneInput && !phoneInput.value.trim()) {
          phoneInput.classList.add('input-invalid');
          const err = document.getElementById('error-phone');
          if (err) err.style.display = 'block';
          isValid = false;
        }

        if (isValid) {
          const rawPhone = phoneInput.value.trim();
          const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

          // Generate unique description matching rule (ASSEMBLE-<phone>)
          const paymentCode = "ASSEMBLE-" + cleanPhone;

          // Build VietQR dynamic pre-filled image URL with BIDV
          const qrBaseUrl = "https://img.vietqr.io/image/bidv-113366668888-compact.png";
          const qrParams = `?amount=7997000&addInfo=${encodeURIComponent(paymentCode)}&accountName=CONG%20TY%20SUNEXT`;
          
          document.getElementById('payment-qr-img').src = qrBaseUrl + qrParams;
          document.getElementById('payment-desc').textContent = paymentCode;

          // Step 1 -> Step 2 transition
          regForm.style.display = 'none';
          thankYouMsg.style.display = 'block';

          // Start 15-minute countdown for Step 2
          const timerEl = document.getElementById('payment-timer-countdown');
          if (timerEl) {
            startPaymentTimer(15 * 60, timerEl);
          }
        }
      });
    }

    // Step 2 timer helper
    let paymentTimerInterval;
    function startPaymentTimer(durationSeconds, displayEl) {
      if (paymentTimerInterval) clearInterval(paymentTimerInterval);
      let timer = durationSeconds;
      
      function updateTimer() {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        displayEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (--timer < 0) {
          clearInterval(paymentTimerInterval);
          displayEl.textContent = "Hết hạn";
        }
      }
      
      updateTimer();
      paymentTimerInterval = setInterval(updateTimer, 1000);
    }

    // Step 2 -> Step 3 Transition
    const btnPaid = document.getElementById('btn-paid');
    const successConfirmMsg = document.getElementById('success-confirm-message');
    if (btnPaid && successConfirmMsg) {
      btnPaid.addEventListener('click', () => {
        thankYouMsg.style.display = 'none';
        successConfirmMsg.style.display = 'block';
        if (paymentTimerInterval) clearInterval(paymentTimerInterval);
      });
    }

    tickCountdown();
    setInterval(tickCountdown, 1000);

    // Scarcity Bar Animate JS
    const scarcityFill = document.querySelector('.scarcity-fill');
    if (scarcityFill) {
      setTimeout(() => scarcityFill.classList.add('animated'), 800);
    }

    // Typing Cursor effect for CRM Success line
    const typingLine = document.querySelector('.msg-meta--success');
    if (typingLine) {
      const originalText = typingLine.textContent;
      typingLine.textContent = '';
      let i = 0;
      const timer = setInterval(() => {
        if (i < originalText.length) {
          typingLine.textContent += originalText[i++];
        } else {
          clearInterval(timer);
        }
      }, 40);
    }

    // FAQ Accordion click handler
    document.querySelectorAll('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        item.classList.toggle('open');
        btn.setAttribute('aria-expanded', item.classList.contains('open'));
      });
    });

    // Pricing Card glow trigger
    const priceCard = document.querySelector('.final-price');
    if (priceCard) {
      const priceObserver = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          priceCard.classList.add('in-view');
          priceObserver.unobserve(priceCard);
        }
      }, { threshold: 0.3 });
      priceObserver.observe(priceCard);
    }

    // Scroll Reveal JS
    const revealEls = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-up');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => revealObserver.observe(el));