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
    const countdownTarget = new Date('2026-05-31T23:59:00+07:00').getTime();

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

    // Google Apps Script Web App configuration
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwenMVthMLNs1Bi-LaD7gWUZCC02HdhXWCgFN5ey1cWBy_tWjhVvbCy-ReatcDtMzm5og/exec';
    let currentPaymentCode = '';
    let pollingInterval = null;

    // Registration Form Validation & Submit
    const regForm = document.getElementById('reg-form');
    const ctaStep1 = document.getElementById('cta-step-1');
    const thankYouMsg = document.getElementById('thank-you-message');

    if (regForm && thankYouMsg) {
      regForm.addEventListener('submit', async (e) => {
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
          const nameVal = nameInput.value.trim();
          const emailVal = emailInput.value.trim();
          const phoneVal = phoneInput.value.trim();
          const tuitionAmount = 7997000;

          // Enter Loading State for submit button
          const submitBtn = regForm.querySelector('button[type="submit"]');
          const originalBtnHtml = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.classList.add('btn--loading');
          submitBtn.innerHTML = `<span class="spinner"></span><span class="btn-text">ĐANG TẠO MÃ THANH TOÁN...</span>`;

          let responseCode = '';

          try {
            const payload = {
              action: "createOrder",
              name: nameVal,
              phone: phoneVal,
              email: emailVal,
              amount: tuitionAmount
            };

            const response = await fetch(SCRIPT_URL, {
              method: 'POST',
              body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data && data.success && data.code) {
              responseCode = data.code;
            } else {
              throw new Error(data ? data.message : "Response not successful");
            }
          } catch (err) {
            console.warn("Google Apps Script integration error, using fallback client-side generator:", err);
            // Generate local unique code matching rule ("A" + 5 random digits)
            const randomDigits = Math.floor(10000 + Math.random() * 90000);
            responseCode = "A" + randomDigits;
          }

          currentPaymentCode = responseCode;
          const paymentCode = "ASSEMBLE-" + responseCode;

          // Build VietQR dynamic pre-filled image URL with BIDV
          const qrBaseUrl = "https://img.vietqr.io/image/bidv-113366668888-compact.png";
          const qrParams = `?amount=${tuitionAmount}&addInfo=${encodeURIComponent(paymentCode)}&accountName=CONG%20TY%20SUNEXT`;
          
          document.getElementById('payment-qr-img').src = qrBaseUrl + qrParams;
          document.getElementById('payment-desc').textContent = paymentCode;

          // Step 1 -> Step 2 transition with classes
          if (ctaStep1) {
            ctaStep1.classList.add('slide-fade-out');
            setTimeout(() => {
              ctaStep1.style.display = 'none';
              thankYouMsg.classList.add('is-active');
              thankYouMsg.offsetHeight; // reflow
              thankYouMsg.classList.add('is-entering');

              // Start 15-minute countdown for Step 2
              const timerEl = document.getElementById('payment-timer-countdown');
              if (timerEl) {
                startPaymentTimer(15 * 60, timerEl);
              }

              // Start polling Web App for status changes
              startPaymentPolling(responseCode);

              // Restore submit button state in case they reload/back out
              submitBtn.disabled = false;
              submitBtn.classList.remove('btn--loading');
              submitBtn.innerHTML = originalBtnHtml;
            }, 300);
          } else {
            regForm.style.display = 'none';
            thankYouMsg.style.display = 'block';
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
        const minStr = String(minutes).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');
        
        const minEl = document.getElementById('pm-min');
        const secEl = document.getElementById('pm-sec');
        
        if (!minEl || !secEl) {
          displayEl.innerHTML = `
            <span class="payment-timer-countdown">
              <span class="payment-timer-unit" id="pm-min">${minStr}</span>
              <span class="payment-timer-colon">:</span>
              <span class="payment-timer-unit" id="pm-sec">${secStr}</span>
            </span>
          `;
        } else {
          updateTimerDigit(minEl, minStr);
          updateTimerDigit(secEl, secStr);
        }
        
        const progressPercent = (timer / durationSeconds) * 100;
        const progressBar = document.getElementById('payment-progress-bar');
        if (progressBar) {
          progressBar.style.width = progressPercent + '%';
        }
        
        if (--timer < 0) {
          clearInterval(paymentTimerInterval);
          if (pollingInterval) clearInterval(pollingInterval); // Stop status polling on timeout
          displayEl.textContent = "Hết hạn";
          if (progressBar) progressBar.style.width = '0%';
        }
      }
      
      function updateTimerDigit(el, val) {
        if (el.textContent !== val) {
          el.classList.add('flip');
          el.textContent = val;
          setTimeout(() => el.classList.remove('flip'), 150);
        }
      }
      
      updateTimer();
      paymentTimerInterval = setInterval(updateTimer, 1000);
    }

    // Background status check interval (Poll every 5 seconds)
    function startPaymentPolling(code) {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = setInterval(async () => {
        try {
          const response = await fetch(`${SCRIPT_URL}?action=checkStatus&code=${encodeURIComponent(code)}`);
          const data = await response.json();
          if (data && data.success && data.status === 'PAID') {
            handlePaymentSuccess(data.zaloUrl);
          }
        } catch (err) {
          console.error("Error polling payment status:", err);
        }
      }, 5000);
    }

    // Transition to Step 3 success modal and redirect
    function handlePaymentSuccess(zaloUrl) {
      if (pollingInterval) clearInterval(pollingInterval);
      if (paymentTimerInterval) clearInterval(paymentTimerInterval);

      // Default fallback url if not provided
      const redirectUrl = zaloUrl || "https://zalo.me/g/sdczb5ehiqm9tyimg1th";
      
      // Update Zalo button link in Step 3
      const zaloBtn = document.getElementById('zalo-group-btn');
      if (zaloBtn) {
        zaloBtn.href = redirectUrl;
      }

      const successConfirmMsg = document.getElementById('success-confirm-message');
      if (thankYouMsg && successConfirmMsg) {
        thankYouMsg.classList.add('slide-fade-out');
        setTimeout(() => {
          thankYouMsg.classList.remove('is-active', 'is-entering', 'slide-fade-out');
          thankYouMsg.style.display = 'none';
          
          successConfirmMsg.classList.add('is-active');
          successConfirmMsg.offsetHeight; // reflow
          successConfirmMsg.classList.add('is-entering');
          
          // Auto-redirect after 2 seconds
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
        }, 300);
      }
    }

    // Step 2 -> Step 3 Transition on manual verify button click
    const btnPaid = document.getElementById('btn-paid');
    const successConfirmMsg = document.getElementById('success-confirm-message');
    if (btnPaid && successConfirmMsg) {
      btnPaid.addEventListener('click', async () => {
        // 1. Enter Loading State
        btnPaid.disabled = true;
        btnPaid.classList.add('btn--loading');
        const originalText = btnPaid.innerHTML;
        btnPaid.innerHTML = `<span class="spinner"></span><span class="btn-paid-text">ĐANG XÁC MINH GIAO DỊCH...</span>`;
        
        try {
          if (currentPaymentCode) {
            const response = await fetch(`${SCRIPT_URL}?action=checkStatus&code=${encodeURIComponent(currentPaymentCode)}`);
            const data = await response.json();
            
            if (data && data.success && data.status === 'PAID') {
              handlePaymentSuccess(data.zaloUrl);
              return;
            } else {
              // Not paid yet
              alert("Hệ thống chưa ghi nhận được thanh toán. Vui lòng chờ 1-2 phút hoặc liên hệ hỗ trợ nếu đã chuyển khoản thành công.");
            }
          } else {
            throw new Error("No payment code generated");
          }
        } catch (err) {
          console.warn("Manual check error, showing fallback options:", err);
          // Fallback manual transition if API down or CORS issue
          const confirmPaid = confirm("Hệ thống đối soát tự động đang bận. Nếu bạn ĐÃ chuyển khoản thành công, bấm OK để tham gia nhóm Zalo của lớp học ngay.");
          if (confirmPaid) {
            handlePaymentSuccess("https://zalo.me/g/sdczb5ehiqm9tyimg1th");
            return;
          }
        } finally {
          // Reset button state if not transitioned
          btnPaid.disabled = false;
          btnPaid.classList.remove('btn--loading');
          btnPaid.innerHTML = originalText;
        }
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

    // SYNCHRONIZED HOVER BETWEEN LAYER CARDS AND SVG NODES
    const layerCards = document.querySelectorAll('.layer-card');
    const svgNodes = document.querySelectorAll('.svg-node');

    layerCards.forEach((card, index) => {
      const nodeNum = index + 1;
      const correspondingNode = document.querySelector(`.svg-node-${nodeNum}`);
      if (correspondingNode) {
        card.addEventListener('mouseenter', () => {
          correspondingNode.classList.add('svg-node--active');
        });
        card.addEventListener('mouseleave', () => {
          correspondingNode.classList.remove('svg-node--active');
        });
      }
    });

    svgNodes.forEach((node) => {
      const classList = Array.from(node.classList);
      const nodeClass = classList.find(c => c.startsWith('svg-node-') && c !== 'svg-node-center');
      if (nodeClass) {
        const nodeNum = nodeClass.split('-')[2];
        const correspondingCard = document.querySelector(`.layer-card:nth-child(${nodeNum})`);
        if (correspondingCard) {
          node.addEventListener('mouseenter', () => {
            correspondingCard.classList.add('layer-card--active');
          });
          node.addEventListener('mouseleave', () => {
            correspondingCard.classList.remove('layer-card--active');
          });
        }
      }
    });

    // COUNT-UP ANIMATION FOR CASE STUDY STATS
    const statValues = document.querySelectorAll('.case-stat-value');
    if (statValues.length > 0) {
      const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const targetEl = entry.target;
            const targetText = targetEl.textContent.trim();
            const targetNum = parseInt(targetText, 10);
            const suffix = targetText.replace(/[0-9]/g, ''); // %, s, etc.
            let current = 0;
            const duration = 1200; // ms
            const stepTime = Math.max(Math.floor(duration / targetNum), 15);
            const timer = setInterval(() => {
              current += 1;
              targetEl.textContent = current + suffix;
              if (current >= targetNum) {
                clearInterval(timer);
                targetEl.textContent = targetText; // guarantee exact match
              }
            }, stepTime);
            statObserver.unobserve(targetEl);
          }
        });
      }, { threshold: 0.5 });
      statValues.forEach(el => statObserver.observe(el));
    }

    // GALLERY SHOW MORE/LESS TOGGLE
    const btnShowMore = document.getElementById('btn-show-more-testimonials');
    if (btnShowMore) {
      let expanded = false;
      btnShowMore.addEventListener('click', () => {
        expanded = !expanded;
        const hiddenCards = document.querySelectorAll('.testimonial-img-card');
        
        hiddenCards.forEach((card, index) => {
          if (index >= 6) {
            if (expanded) {
              card.classList.remove('is-hidden');
              card.classList.add('fade-in');
            } else {
              card.classList.add('is-hidden');
              card.classList.remove('fade-in');
            }
          }
        });

        if (expanded) {
          btnShowMore.innerHTML = `Ẩn bớt phản hồi <i class="ti ti-chevron-up"></i>`;
        } else {
          btnShowMore.innerHTML = `Xem thêm phản hồi thực tế <i class="ti ti-chevron-down"></i>`;
          const testimonialsHeader = document.querySelector('.testimonials .section-header');
          if (testimonialsHeader) {
            testimonialsHeader.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }

    // GALLERY LIGHTBOX MODAL
    const imgCards = document.querySelectorAll('.testimonial-img-card img');
    const lightbox = document.getElementById('testimonial-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (lightbox && lightboxImg) {
      imgCards.forEach(img => {
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          lightboxImg.src = img.src;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden'; // prevent scroll behind
        });
      });

      const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      };

      if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
      }
      lightbox.addEventListener('click', closeLightbox);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeLightbox();
        }
      });
    }