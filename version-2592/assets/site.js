document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function restartTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(nextSlide, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        restartTimer();
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
        restartTimer();
      });
    });

    restartTimer();
  }

  const searchInput = document.querySelector('[data-search]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const emptyState = document.querySelector('[data-empty]');
  let activeFilter = 'all';

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    cards.forEach(function(card) {
      const cardText = card.getAttribute('data-searchtext') || '';
      const category = card.getAttribute('data-category') || '';
      const categoryMatch = activeFilter === 'all' || activeFilter === category;
      const searchMatch = !query || cardText.indexOf(query) !== -1;
      const visible = categoryMatch && searchMatch;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function(item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  applyFilters();
});
