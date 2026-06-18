(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (slides.length < 2) {
      return;
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupCardFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-card-search]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var active = "全部";

      function apply() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var data = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchesQuery = !query || data.indexOf(query) !== -1;
          var matchesFilter = active === "全部" || card.getAttribute("data-type") === active;
          card.classList.toggle("hidden-card", !(matchesQuery && matchesFilter));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter-value") || "全部";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <span class="poster-wrap">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-shade"></span>',
      '      <span class="play-hover">▶</span>',
      '      <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    </span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.MovieSearchData) {
      return;
    }
    var status = document.querySelector("[data-search-status]");
    var input = document.querySelector("[data-search-page-input]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    function render(value) {
      var q = normalize(value);
      if (!q) {
        results.innerHTML = "";
        if (status) {
          status.textContent = "请输入关键词开始搜索";
        }
        return;
      }
      var matched = window.MovieSearchData.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" ")
        ].join(" ")).indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(renderSearchCard).join("");
      if (status) {
        status.textContent = matched.length ? "以下影片与关键词相关" : "暂未找到相关影片";
      }
    }
    render(query);
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var source = player.getAttribute("data-source");
      var hlsInstance = null;
      var loaded = false;

      function loadAndPlay() {
        if (!video || !source) {
          return;
        }
        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            loaded = true;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            loaded = true;
          } else {
            video.src = source;
            loaded = true;
          }
        }
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", loadAndPlay);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            loadAndPlay();
          } else {
            video.pause();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  }

  onReady(function () {
    setupMobileMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
