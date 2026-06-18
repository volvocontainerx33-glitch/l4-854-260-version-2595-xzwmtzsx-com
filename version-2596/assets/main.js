(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const opened = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let index = 0;
  let timer = null;

  function showHero(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showHero(index + 1);
    }, 5000);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    startHero();
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(index - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(index + 1);
      restartHero();
    });
  }

  startHero();

  const searchInput = document.querySelector('#movie-search');
  const yearFilter = document.querySelector('#year-filter');
  const typeFilter = document.querySelector('#type-filter');
  const categoryFilter = document.querySelector('#category-filter');
  const countNode = document.querySelector('[data-visible-count]');
  const cards = Array.from(document.querySelectorAll('.movie-card[data-search]'));

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  if (searchInput && cards.length) {
    const initialQuery = getParam('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
  }

  if (yearFilter) {
    const initialYear = getParam('year');
    if (initialYear) {
      yearFilter.value = initialYear;
    }
  }

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const year = yearFilter ? yearFilter.value : '';
    const type = typeFilter ? typeFilter.value : '';
    const category = categoryFilter ? categoryFilter.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const matchesQuery = !query || (card.getAttribute('data-search') || '').toLowerCase().includes(query);
      const matchesYear = !year || card.getAttribute('data-year') === year;
      const matchesType = !type || card.getAttribute('data-type') === type;
      const matchesCategory = !category || card.getAttribute('data-category') === category;
      const shouldShow = matchesQuery && matchesYear && matchesType && matchesCategory;
      card.classList.toggle('is-filter-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (countNode) {
      countNode.textContent = String(visible);
    }
  }

  [searchInput, yearFilter, typeFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
})();
