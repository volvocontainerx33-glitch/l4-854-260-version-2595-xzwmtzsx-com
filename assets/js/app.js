(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    showHero(0);
    startHero();
  }

  qsa('[data-year-pills]').forEach(function (pillBox) {
    var buttons = qsa('[data-year-filter]', pillBox);
    var grid = qs('[data-filter-grid]');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var year = button.getAttribute('data-year-filter');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        qsa('[data-movie-card]', grid).forEach(function (card) {
          var match = year === 'all' || card.getAttribute('data-year') === year;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  });

  function cardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-category') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-tags') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  qsa('[data-card-grid]').forEach(function (grid) {
    var section = grid.closest('section') || document;
    var input = qs('[data-card-search]', section);
    var yearSelect = qs('[data-card-year]', section);
    var empty = qs('[data-empty-message]', section);

    function applyLocalFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : 'all';
      var visible = 0;

      qsa('[data-movie-card]', grid).forEach(function (card) {
        var yearMatch = year === 'all' || card.getAttribute('data-year') === year;
        var textMatch = !keyword || cardText(card).indexOf(keyword) !== -1;
        var show = yearMatch && textMatch;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyLocalFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyLocalFilter);
    }
  });

  var searchForm = qs('[data-search-form]');
  var searchResults = qs('[data-search-results]');

  if (searchForm && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var searchInput = qs('[data-search-input]', searchForm);
    var searchCategory = qs('[data-search-category]', searchForm);
    var searchYear = qs('[data-search-year]', searchForm);
    var searchEmpty = qs('[data-empty-message]');

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    function applySearchFilter(event) {
      if (event) {
        event.preventDefault();
      }

      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var category = searchCategory ? searchCategory.value : 'all';
      var year = searchYear ? searchYear.value : 'all';
      var visible = 0;

      qsa('[data-movie-card]', searchResults).forEach(function (card) {
        var textMatch = !keyword || cardText(card).indexOf(keyword) !== -1;
        var categoryMatch = category === 'all' || card.getAttribute('data-category') === category;
        var yearMatch = year === 'all' || card.getAttribute('data-year') === year;
        var show = textMatch && categoryMatch && yearMatch;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (searchEmpty) {
        searchEmpty.classList.toggle('is-visible', visible === 0);
      }
    }

    searchForm.addEventListener('submit', applySearchFilter);

    if (searchInput) {
      searchInput.addEventListener('input', applySearchFilter);
    }

    if (searchCategory) {
      searchCategory.addEventListener('change', applySearchFilter);
    }

    if (searchYear) {
      searchYear.addEventListener('change', applySearchFilter);
    }

    applySearchFilter();
  }
})();
