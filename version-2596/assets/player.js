import { H as Hls } from './hls-vendor-dru42stk.js';

export function setupMoviePlayer(options) {
  const video = document.querySelector(options.video);
  const overlay = document.querySelector(options.overlay);
  const source = options.source;
  let hls = null;
  let attached = false;

  if (!video || !overlay || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      attached = true;
    }
  }

  function playVideo() {
    attachSource();
    overlay.classList.add('is-hidden');
    video.controls = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
