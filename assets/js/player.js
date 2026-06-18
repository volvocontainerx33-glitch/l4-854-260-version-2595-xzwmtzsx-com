(function () {
  var video = document.getElementById('movie-video');
  var button = document.getElementById('movie-play-button');
  var status = document.getElementById('player-status');
  var configNode = document.getElementById('player-config');

  if (!video || !button || !configNode) {
    return;
  }

  var config = {};

  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var source = config.src || '';
  var shell = video.closest('.player-shell');
  var hls = null;
  var attached = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message || '';
    }
  }

  function attachSource() {
    if (attached || !source) {
      return;
    }

    attached = true;
    setStatus('加载中...');

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        setStatus('播放加载失败，请稍后再试');

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setStatus('');
      }, { once: true });
      video.addEventListener('error', function () {
        setStatus('播放加载失败，请稍后再试');
      });
    } else {
      setStatus('当前设备无法播放该视频');
    }
  }

  function playVideo() {
    attachSource();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('点击视频区域继续播放');
      });
    }
  }

  button.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (shell) {
      shell.classList.add('is-playing');
    }
  });

  video.addEventListener('pause', function () {
    if (shell) {
      shell.classList.remove('is-playing');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
