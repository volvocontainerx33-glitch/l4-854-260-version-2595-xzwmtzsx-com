(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-scroll]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.getElementById(button.getAttribute('data-target'));
      if (!target) {
        return;
      }

      var direction = button.getAttribute('data-scroll') === 'left' ? -1 : 1;
      target.scrollBy({ left: direction * 520, behavior: 'smooth' });
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function (input) {
    var scope = input.closest('section').querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase() + ' ' + Array.prototype.join.call(card.attributes, ' ');
        card.classList.toggle('is-hidden-card', keyword && text.indexOf(keyword) === -1);
      });
    });
  });

  var searchInput = document.getElementById('searchInput');
  var regionFilter = document.getElementById('regionFilter');
  var yearFilter = document.getElementById('yearFilter');
  var searchGrid = document.getElementById('searchGrid');

  if (searchInput && regionFilter && yearFilter && searchGrid) {
    var searchCards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));

    function applySearch() {
      var keyword = searchInput.value.trim().toLowerCase();
      var region = regionFilter.value;
      var year = yearFilter.value;

      searchCards.forEach(function (card) {
        var text = card.textContent.toLowerCase() + ' ' + (card.getAttribute('data-tags') || '').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedRegion = !region || cardRegion === region;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle('is-hidden-card', !(matchedKeyword && matchedRegion && matchedYear));
      });
    }

    searchInput.addEventListener('input', applySearch);
    regionFilter.addEventListener('change', applySearch);
    yearFilter.addEventListener('change', applySearch);
  }
})();
