(function () {
  var Hls = window.Hls;
  var dataNode = document.getElementById('player-data');
  var shell = document.querySelector('.player-shell');
  var video = document.querySelector('.movie-video');
  var cover = document.querySelector('.player-cover');
  var button = document.querySelector('.player-play');

  if (!dataNode || !shell || !video) {
    return;
  }

  var playerData = {};

  try {
    playerData = JSON.parse(dataNode.textContent || '{}');
  } catch (error) {
    playerData = {};
  }

  var hasAttached = false;

  function attachSource() {
    if (hasAttached || !playerData.source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playerData.source;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(playerData.source);
      hls.attachMedia(video);
    } else {
      video.src = playerData.source;
    }

    hasAttached = true;
  }

  function playMovie(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    attachSource();
    shell.classList.add('is-playing');
    video.controls = true;

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', playMovie);
  }

  if (cover) {
    cover.addEventListener('click', playMovie);
  }

  shell.addEventListener('click', function (event) {
    if (!hasAttached && (event.target === shell || event.target === video)) {
      playMovie(event);
    }
  });
})();
