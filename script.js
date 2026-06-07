/* ==========================================================================
   Akhil Energy Solutions INTERACTIVE JAVASCRIPT
   Author: Antigravity
   Intersection Observer Counters, Interactive Tab Swaps & Validate Modal System
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Sticky Header Effects on Scroll
  const header = document.getElementById('main-header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger immediately in case page is refreshed while scrolled

  // 3. Mobile Navigation Menu Toggle & Dropdowns
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navNavigation = document.getElementById('nav-navigation');
  const navOverlay = document.getElementById('nav-overlay');
  const openIcon = mobileMenuToggle.querySelector('.menu-open-icon');
  const closeIcon = mobileMenuToggle.querySelector('.menu-close-icon');

  const toggleMenu = () => {
    const isActive = navNavigation.classList.toggle('active');
    navOverlay.classList.toggle('active');
    openIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');

    if (isActive) {
      document.body.classList.add('scroll-locked');
    } else {
      if (!quoteModal || !quoteModal.classList.contains('active')) {
        document.body.classList.remove('scroll-locked');
      }
      // Collapse all mobile dropdowns when menu is closed
      document.querySelectorAll('.nav-item.dropdown').forEach(item => {
        item.classList.remove('dropdown-open');
      });
    }
  };

  mobileMenuToggle.addEventListener('click', toggleMenu);

  if (navOverlay) {
    navOverlay.addEventListener('click', () => {
      if (navNavigation.classList.contains('active')) {
        toggleMenu();
      }
    });
  }

  // Handle all link clicks inside mobile menu
  const menuLinks = document.querySelectorAll('.nav-menu a');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const isDropdownTrigger = link.parentElement.classList.contains('dropdown');

      if (window.innerWidth <= 768 && isDropdownTrigger) {
        // Dropdown trigger logic on mobile / touch devices
        e.preventDefault();
        e.stopPropagation();

        const parentItem = link.parentElement;
        // Close other dropdowns
        document.querySelectorAll('.nav-item.dropdown').forEach(item => {
          if (item !== parentItem) {
            item.classList.remove('dropdown-open');
          }
        });

        parentItem.classList.toggle('dropdown-open');
      } else {
        // Regular link click: close mobile menu drawer if it is open
        if (navNavigation.classList.contains('active')) {
          toggleMenu();
        }
      }
    });
  });

  // 4. Snapshots Swipeable Carousel Logic
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const indicators = document.querySelectorAll('#carousel-indicators .indicator');
  const slides = document.querySelectorAll('.carousel-slide');

  if (track && prevBtn && nextBtn && indicators.length > 0 && slides.length > 0) {
    const getSlideWidth = () => {
      // clientWidth handles responsive scaling of slide elements
      return track.clientWidth;
    };

    const getCurrentIndex = () => {
      const scrollLeft = track.scrollLeft;
      const slideWidth = getSlideWidth();
      if (slideWidth === 0) return 0;
      return Math.round(scrollLeft / slideWidth);
    };

    const scrollToIndex = (index) => {
      const slideWidth = getSlideWidth();
      track.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
    };

    // 4.1. Previous Slide Button Action
    prevBtn.addEventListener('click', () => {
      const currentIndex = getCurrentIndex();
      let targetIndex = currentIndex - 1;
      if (targetIndex < 0) {
        targetIndex = slides.length - 1; // Wrap around to the end
      }
      scrollToIndex(targetIndex);
    });

    // 4.2. Next Slide Button Action
    nextBtn.addEventListener('click', () => {
      const currentIndex = getCurrentIndex();
      let targetIndex = currentIndex + 1;
      if (targetIndex >= slides.length) {
        targetIndex = 0; // Wrap around to the start
      }
      scrollToIndex(targetIndex);
    });

    // 4.3. Indicator Dots Action
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        scrollToIndex(index);
      });
    });

    // 4.4. Sync Indicator Dots on Touch Scroll or Swipe
    const updateActiveIndicator = () => {
      const currentIndex = getCurrentIndex();
      indicators.forEach((ind, idx) => {
        if (idx === currentIndex) {
          ind.classList.add('active');
        } else {
          ind.classList.remove('active');
        }
      });
    };

    let scrollFrame;
    track.addEventListener('scroll', () => {
      if (scrollFrame) {
        window.cancelAnimationFrame(scrollFrame);
      }
      scrollFrame = window.requestAnimationFrame(updateActiveIndicator);
    });

    // Sync on resize in case container size changes
    window.addEventListener('resize', updateActiveIndicator);
  }

  // 5. Stat Counter Increment Animation with Intersection Observer
  const statsElements = document.querySelectorAll('.stat-number');

  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 1500; // Animation duration in milliseconds
    const stepTime = Math.max(Math.floor(duration / target), 10);
    let current = 0;

    const counterInterval = setInterval(() => {
      current += Math.ceil(target / (duration / stepTime));
      if (current >= target) {
        element.textContent = target.toLocaleString();
        clearInterval(counterInterval);
      } else {
        element.textContent = current.toLocaleString();
      }
    }, stepTime);
  };

  const observerOptions = {
    root: null, // viewport
    threshold: 0.1, // Trigger when 10% of element is in view
    once: true // Custom indicator to animate only once
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        if (!element.classList.contains('animated')) {
          element.classList.add('animated');
          animateCounter(element);
          observer.unobserve(element); // Stop observing after animation is fired
        }
      }
    });
  }, observerOptions);

  statsElements.forEach(element => {
    statsObserver.observe(element);
  });

  // 6. Interactive Quote Estimation Modal Controller
  const quoteModal = document.getElementById('quote-modal');
  const quoteForm = document.getElementById('quote-form');
  const modalCloseBtn = document.getElementById('modal-close');
  const successCloseBtn = document.getElementById('success-close-btn');
  const submitBtn = document.getElementById('submit-btn');
  const formSpinner = document.getElementById('form-spinner');
  const successState = document.getElementById('modal-success-state');

  // Select all trigger buttons (GET A QUOTE & CONTACT US)
  const triggerBtns = document.querySelectorAll('.quote-trigger-btn, .btn-contact');

  const openModal = () => {
    quoteModal.classList.add('active');
    document.body.classList.add('scroll-locked');
  };

  const closeModal = () => {
    quoteModal.classList.remove('active');
    if (!navNavigation || !navNavigation.classList.contains('active')) {
      document.body.classList.remove('scroll-locked');
    }

    // Reset form states after close animation completes
    setTimeout(() => {
      quoteForm.reset();
      quoteForm.classList.remove('hidden');
      successState.classList.add('hidden');
      submitBtn.disabled = false;
      formSpinner.classList.add('hidden');
      submitBtn.querySelector('.btn-text').textContent = 'GENERATE MY ESTIMATE';
    }, 400);
  };

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  modalCloseBtn.addEventListener('click', closeModal);
  successCloseBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside on the backdrop
  quoteModal.addEventListener('click', (e) => {
    if (e.target === quoteModal) {
      closeModal();
    }
  });

  // 7. Form Submission simulation
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Disable submit to prevent double-clicks
    submitBtn.disabled = true;
    formSpinner.classList.remove('hidden');
    submitBtn.querySelector('.btn-text').textContent = 'CALCULATING SAVINGS...';

    // Simulate server side validation/calculation (1.5 seconds)
    setTimeout(() => {
      formSpinner.classList.add('hidden');
      quoteForm.classList.add('hidden');
      successState.classList.remove('hidden');

      // Update checkmark icon inside the success container
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 1500);
  });

});
