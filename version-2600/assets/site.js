(function () {
  var searchToggles = document.querySelectorAll('.search-toggle');
  var siteSearch = document.querySelector('.site-search');
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  var searchInputs = document.querySelectorAll('[data-search-input]');
  var cards = document.querySelectorAll('[data-card-text]');
  var emptyState = document.querySelector('.empty-state');

  searchToggles.forEach(function (button) {
    button.addEventListener('click', function () {
      if (!siteSearch) {
        return;
      }
      siteSearch.hidden = !siteSearch.hidden;
      if (!siteSearch.hidden) {
        var input = siteSearch.querySelector('input');
        if (input) {
          input.focus();
        }
      }
    });
  });

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.hidden = !mobileNav.hidden;
    });
  }

  function applySearch(value) {
    var query = String(value || '').trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var text = String(card.getAttribute('data-card-text') || '').toLowerCase();
      var matched = !query || text.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = input.value;
        }
      });
      applySearch(input.value);
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }
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
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      restart();
    });
  });

  restart();
})();
