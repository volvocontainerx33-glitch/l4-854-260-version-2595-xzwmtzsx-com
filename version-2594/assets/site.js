(function () {
  var qs = function (selector, root) {
    return (root || document).querySelector(selector);
  };
  var qsa = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };
  var norm = function (value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  };

  function initMenu() {
    var button = qs("[data-menu-button]");
    var nav = qs("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.hidden = !nav.hidden;
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) return;
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    if (!slides.length) return;
    var index = 0;
    var timer = null;
    var show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    };
    var start = function () {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    var stop = function () {
      if (timer) window.clearInterval(timer);
      timer = null;
    };
    if (prev) prev.addEventListener("click", function () { show(index - 1); start(); });
    if (next) next.addEventListener("click", function () { show(index + 1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); start(); });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initRows() {
    qsa("[data-row]").forEach(function (wrap) {
      var row = qs("[data-row-track]", wrap);
      var left = qs("[data-row-left]", wrap);
      var right = qs("[data-row-right]", wrap);
      if (!row) return;
      if (left) left.addEventListener("click", function () { row.scrollBy({ left: -520, behavior: "smooth" }); });
      if (right) right.addEventListener("click", function () { row.scrollBy({ left: 520, behavior: "smooth" }); });
    });
  }

  function applyQueryToInput(root) {
    var input = qs("[data-filter-key]", root);
    if (!input) return;
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) input.value = q;
  }

  function initFilters() {
    qsa("[data-filter-root]").forEach(function (root) {
      var input = qs("[data-filter-key]", root);
      var region = qs("[data-filter-region]", root);
      var type = qs("[data-filter-type]", root);
      var year = qs("[data-filter-year]", root);
      var cards = qsa("[data-card]", root);
      applyQueryToInput(root);
      var run = function () {
        var key = norm(input && input.value);
        var regionValue = region && region.value;
        var typeValue = type && type.value;
        var yearValue = year && year.value;
        cards.forEach(function (card) {
          var haystack = norm([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
          ].join(" "));
          var matched = true;
          if (key && haystack.indexOf(key) === -1) matched = false;
          if (regionValue && card.dataset.region !== regionValue) matched = false;
          if (typeValue && card.dataset.type !== typeValue) matched = false;
          if (yearValue && card.dataset.year !== yearValue) matched = false;
          card.classList.toggle("hidden-card", !matched);
        });
      };
      [input, region, type, year].forEach(function (el) {
        if (el) el.addEventListener("input", run);
        if (el) el.addEventListener("change", run);
      });
      run();
    });
  }

  function initPlayer() {
    var video = qs("[data-player]");
    if (!video) return;
    var src = video.getAttribute("data-stream");
    var cover = qs("[data-play]");
    var attached = false;
    var attach = function () {
      if (attached) return;
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
        return;
      }
      video.src = src;
    };
    var play = function () {
      attach();
      if (cover) cover.classList.add("is-hidden");
      var result = video.play();
      if (result && typeof result.catch === "function") result.catch(function () {});
    };
    if (cover) cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) play();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initRows();
    initFilters();
    initPlayer();
  });
}());
