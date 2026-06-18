(function () {
  window.initMoviePlayer = function (videoUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');
    var hls = null;
    var loaded = false;

    if (!video || !videoUrl) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }

      loaded = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function startPlayback() {
      loadVideo();
      hideOverlay();

      var playing = video.play();

      if (playing && typeof playing.catch === 'function') {
        playing.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('loadedmetadata', hideOverlay);

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
