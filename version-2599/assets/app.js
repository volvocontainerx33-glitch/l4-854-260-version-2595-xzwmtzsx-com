(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function textIncludes(value, keyword) {
    return (
      String(value || "")
        .toLowerCase()
        .indexOf(keyword) !== -1
    );
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var searchToggle = document.querySelector("[data-search-toggle]");
    var searchPanel = document.querySelector("[data-search-panel]");
    var globalInput = document.querySelector("[data-global-search]");
    var globalResults = document.querySelector("[data-global-results]");
    if (searchToggle && searchPanel) {
      searchToggle.addEventListener("click", function () {
        searchPanel.classList.toggle("is-open");
        if (searchPanel.classList.contains("is-open") && globalInput) {
          globalInput.focus();
        }
      });
    }

    if (globalInput && globalResults) {
      globalInput.addEventListener("input", function () {
        var keyword = globalInput.value.trim().toLowerCase();
        if (!keyword) {
          globalResults.classList.remove("is-open");
          globalResults.innerHTML = "";
          return;
        }
        var list = Array.isArray(window.SEARCH_INDEX)
          ? window.SEARCH_INDEX
          : [];
        var results = list
          .filter(function (item) {
            return (
              textIncludes(item.title, keyword) ||
              textIncludes(item.text, keyword)
            );
          })
          .slice(0, 12);
        globalResults.innerHTML = results
          .map(function (item) {
            return (
              '<a class="search-result-item" href="' +
              item.link +
              '"><strong>' +
              item.title +
              "</strong><span>" +
              item.category +
              " · " +
              item.year +
              " · " +
              item.region +
              "</span></a>"
            );
          })
          .join("");
        if (!results.length) {
          globalResults.innerHTML =
            '<div class="search-result-item"><strong>没有找到相关影片</strong><span>换个关键词继续搜索</span></div>';
        }
        globalResults.classList.add("is-open");
      });
    }

    document
      .querySelectorAll("[data-hero-carousel]")
      .forEach(function (carousel) {
        var slides = Array.prototype.slice.call(
          carousel.querySelectorAll(".hero-slide"),
        );
        var dots = Array.prototype.slice.call(
          carousel.querySelectorAll(".hero-dot"),
        );
        if (!slides.length) {
          return;
        }
        var index = 0;
        function show(nextIndex) {
          index = (nextIndex + slides.length) % slides.length;
          slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
          });
          dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
          });
        }
        dots.forEach(function (dot, dotIndex) {
          dot.addEventListener("click", function () {
            show(dotIndex);
          });
        });
        setInterval(function () {
          show(index + 1);
        }, 5600);
        show(0);
      });

    document
      .querySelectorAll("[data-card-filter-wrap]")
      .forEach(function (wrap) {
        var keywordInput = wrap.querySelector("[data-card-filter]");
        var yearSelect = wrap.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(
          document.querySelectorAll(".movie-card[data-card]"),
        );
        var empty = document.querySelector("[data-empty-state]");
        function applyFilter() {
          var keyword = keywordInput
            ? keywordInput.value.trim().toLowerCase()
            : "";
          var year = yearSelect ? yearSelect.value : "";
          var visible = 0;
          cards.forEach(function (card) {
            var text = card.getAttribute("data-card") || "";
            var cardYear = card.getAttribute("data-year") || "";
            var matched =
              (!keyword || text.indexOf(keyword) !== -1) &&
              (!year || cardYear === year);
            card.style.display = matched ? "" : "none";
            if (matched) {
              visible += 1;
            }
          });
          if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
          }
        }
        if (keywordInput) {
          keywordInput.addEventListener("input", applyFilter);
        }
        if (yearSelect) {
          yearSelect.addEventListener("change", applyFilter);
        }
      });
  });

  window.initMoviePlayer = function (videoId, triggerId, streamUrl) {
    var video = document.getElementById(videoId);
    var trigger = document.getElementById(triggerId);
    if (!video || !streamUrl) {
      return;
    }
    var stage = video.closest(".player-stage");
    var initialized = false;

    function attachStream() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attachStream();
      if (stage) {
        stage.classList.add("is-playing");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (stage) {
      stage.addEventListener("click", function (event) {
        if (event.target && event.target.closest("button")) {
          return;
        }
        start();
      });
    }

    video.addEventListener("play", function () {
      if (stage) {
        stage.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (stage && video.currentTime === 0) {
        stage.classList.remove("is-playing");
      }
    });
  };
})();
