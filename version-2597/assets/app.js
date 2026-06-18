(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilterBlocks() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-filterable]"));
    blocks.forEach(function (block) {
      var input = block.querySelector("[data-filter-input]");
      var year = block.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(block.querySelectorAll("[data-filter-list] > *"));

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matched = (!query || text.indexOf(query) !== -1) && (!yearValue || cardYear === yearValue);
          card.classList.toggle("is-hidden", !matched);
        });
      }

      if (input) {
        input.addEventListener("input", update);
      }
      if (year) {
        year.addEventListener("change", update);
      }
    });
  }

  function movieResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span>",
      "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
      "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var input = document.getElementById("global-search-input");
    var button = document.getElementById("global-search-button");
    var results = document.getElementById("search-results");
    var source = window.MOVIE_INDEX || [];
    if (!input || !button || !results || !source.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(query) {
      var normalized = query.trim().toLowerCase();
      var matches = source.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
        return !normalized || haystack.indexOf(normalized) !== -1;
      }).slice(0, 96);
      results.innerHTML = matches.map(movieResultCard).join("");
    }

    button.addEventListener("click", function () {
      render(input.value);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        render(input.value);
      }
    });

    document.querySelectorAll("[data-search-chip]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        input.value = chip.getAttribute("data-search-chip") || "";
        render(input.value);
      });
    });

    render(initial);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var status = player.querySelector(".player-status");
      var source = player.getAttribute("data-video-url");
      var loaded = false;
      var hls = null;

      if (!video || !source) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }

      function attachSource() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            setStatus("视频加载中断，请稍后重试");
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          setStatus("当前浏览器暂不支持播放");
        }
      }

      function play() {
        attachSource();
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setStatus("点击视频继续播放");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        setStatus("");
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilterBlocks();
    initSearchPage();
    initPlayers();
  });
})();
