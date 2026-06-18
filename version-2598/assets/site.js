(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call(
      (parent || document).querySelectorAll(selector),
    );
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function initMenus() {
    var menuButton = $("[data-menu-toggle]");
    var menu = $("[data-mobile-menu]");
    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var searchButton = $("[data-search-toggle]");
    var searchPanel = $("[data-search-panel]");
    var searchInput = $("[data-global-search]");
    if (searchButton && searchPanel) {
      searchButton.addEventListener("click", function () {
        searchPanel.classList.toggle("is-open");
        if (searchPanel.classList.contains("is-open") && searchInput) {
          searchInput.focus();
        }
      });
    }
  }

  function initGlobalSearch() {
    var input = $("[data-global-search]");
    var results = $("[data-search-results]");
    if (!input || !results || !window.MovieIndex) {
      return;
    }

    function render() {
      var query = text(input.value).trim();
      if (!query) {
        results.innerHTML = "";
        return;
      }
      var matches = window.MovieIndex.filter(function (item) {
        return (
          text(item.t + " " + item.c + " " + item.y + " " + item.k).indexOf(
            query,
          ) > -1
        );
      }).slice(0, 12);
      results.innerHTML = matches
        .map(function (item) {
          return (
            '<a href="' +
            item.u +
            '"><strong>' +
            item.t +
            "</strong><span>" +
            item.c +
            " · " +
            item.y +
            "</span></a>"
          );
        })
        .join("");
    }

    input.addEventListener("input", render);
  }

  function initHero() {
    var slides = $all("[data-hero-slide]");
    var dots = $all("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initPageFilters() {
    var list = $("[data-filter-list]");
    var input = $("[data-page-filter]");
    var select = $("[data-year-filter]");
    if (!list) {
      return;
    }
    var cards = $all(".movie-card", list);
    function filter() {
      var query = input ? text(input.value).trim() : "";
      var year = select ? select.value : "";
      cards.forEach(function (card) {
        var haystack = text(
          card.getAttribute("data-title") +
            " " +
            card.getAttribute("data-region") +
            " " +
            card.getAttribute("data-genre"),
        );
        var cardYear = card.getAttribute("data-year") || "";
        var visible =
          (!query || haystack.indexOf(query) > -1) &&
          (!year || cardYear === year);
        card.classList.toggle("is-hidden", !visible);
      });
    }
    if (input) {
      input.addEventListener("input", filter);
    }
    if (select) {
      select.addEventListener("change", filter);
    }
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var overlay = $("[data-player-overlay]");
    if (!video || !source) {
      return;
    }
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenus();
    initGlobalSearch();
    initHero();
    initPageFilters();
  });
})();
