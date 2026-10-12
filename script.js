(function(){
  "use strict";

  /* =========================================================
     0. DATA SOURCE — the ONLY place profile data is declared.
     Adding profile #2, #3, ... #N requires nothing more than
     pushing objects onto this array, or swapping the source
     entirely via setDataSource(). Nothing below this section
     ever needs to change to support 1 profile or a trillion.
     ========================================================= */
  var profiles = [
    {
      id: "alpha",
      name: "Alpha",
      image: "https://raw.githubusercontent.com/mdimrankhanalpha/Alpha/main/file_0000000012b081fa9718ddb092393a0e.png",
      url: "https://mdimrankhanalpha.github.io/Alpha/"
    },
    {
      id: "tde-alpha",
      name: "TDE Alpha",
      role: "Diploma Engineer",
      image: "https://raw.githubusercontent.com/uuhjeike/TDE-Alpha/main/FB_IMG_1789464542803.jpg",
      url: "https://uuhjeike.github.io/TDE-Alpha/"
    },
    {
      id: "clash-of-clans",
      name: "Clash of Clans",
      theme: "coc",
      image: "https://raw.githubusercontent.com/uuhjeike/Clash-of-Clans/main/profile%20photo.png",
      url: "https://uuhjeike.github.io/Clash-of-Clans/"
    },
    {
      id: "brave",
      name: "Brave",
      image: "https://raw.githubusercontent.com/uuhjeike/Brave/main/profile%20photo.jpg",
      url: "https://uuhjeike.github.io/Brave/"
    },
    {
      id: "lucian-vale",
      name: "Lucian Vale",
      image: "https://raw.githubusercontent.com/uuhjeike/Lucian-Vale/main/profile%20photo.jpg",
      url: "https://uuhjeike.github.io/Lucian-Vale-2/"
    },
    {
      id: "shadowignis",
      name: "ShadowIgnis",
      image: "https://raw.githubusercontent.com/uuhjeike/ShadowIgnis/main/b24825560455f51aad495d5420fd6023.jpg",
      url: "https://uuhjeike.github.io/ShadowIgnis/"
    },
    {
      id: "gojo-back",
      name: "Gojo Back",
      image: "https://raw.githubusercontent.com/uuhjeike/Gojo-Back/main/file_000000006f5482309020dd84155307a5.png",
      url: "https://uuhjeike.github.io/Gojo-Back/",
      theme: "gojo",
      video: "https://raw.githubusercontent.com/uuhjeike/Gojo-Back/main/6efa14de8ffe4c2358cb0ae55dc5785e_720w.mp4"
    },
    {
      id: "black-knight",
      name: "Black Knight",
      image: "https://raw.githubusercontent.com/uuhjeike/Black-Knight/main/profile%20photo.jpg",
      url: "https://uuhjeike.github.io/Black-Knight/",
      theme: "blackknight"
    },
    {
      id: "rrf",
      name: "R R F",
      image: "https://raw.githubusercontent.com/uuhjeike/R-R-F/main/a5116b8d20f400ef8fc75713da7dc527.jpg",
      url: "https://uuhjeike.github.io/R-R-F/",
      theme: "rrf"
    },
    {
      id: "zyphorux",
      name: "Zyphorux",
      image: "https://raw.githubusercontent.com/uuhjeike/Zyphorux/main/IMG_20261005_204322.png",
      url: "https://uuhjeike.github.io/Zyphorux/",
      theme: "zyphorux"
    },
    {
      id: "grey-knights",
      name: "Grey Knights",
      image: "https://raw.githubusercontent.com/uuhjeike/Grey-Knights/main/file_000000005e288230942243b599bb8cd4.png",
      url: "https://uuhjeike.github.io/Grey-Knights/",
      theme: "greyknights"
    },
    {
      id: "crimson-singularity",
      name: "Crimson Singularity",
      image: "https://raw.githubusercontent.com/uuhjeike/Crimson-Singularity/main/IMG_20261010_184609.jpg",
      url: "https://uuhjeike.github.io/Crimson-Singularity/",
      theme: "crimson"
    },
    {
      id: "black-hole",
      name: "Black Hole",
      url: "https://uuhjeike.github.io/Black-Hole/",
      theme: "blackhole",
      videoAvatar: "https://raw.githubusercontent.com/uuhjeike/Black-Hole/main/5591d7a8efe3e0b7661923ecab104dfa.mp4"
    }
  ];

  var dataSource = {
    length: function(){ return profiles.length; },
    get: function(i){ return profiles[i]; }
  };

  function setDataSource(src){
    dataSource = src;
    lastRange = [-1,-1];
    renderList(true);
  }
  window.setDataSource = setDataSource; // exposed for future paginated/streamed sources

  /* =========================================================
     1. CONFIG — single source of truth for all timing/tiers
     ========================================================= */
  var CONFIG = {
    loopDuration: 46,
    timeline: {
      voidPhase:      [0, 5],
      formation:      [5, 12],
      approach:       [12, 27],
      megaHold:       [27, 30],
      blackHoleBirth: [30, 33],
      consumption:    [33, 40],
      collapse:       [40, 43],
      destruction:    [43, 44],
      darkness:       [44, 46]
    },
    buffer: 8
  };

  var PERF_TIERS = {
    HIGH:   { galaxyStars: 7000, galaxyDust: 2600, galaxyDustLane: 1600, starfield: 3000, debris: 1200, dpr: 2 },
    MEDIUM: { galaxyStars: 3400, galaxyDust: 1300, galaxyDustLane: 800,  starfield: 1500, debris: 600, dpr: 1.5 },
    LOW:    { galaxyStars: 1300, galaxyDust: 500,  galaxyDustLane: 320,  starfield: 600, debris: 250, dpr: 1 }
  };

  function detectTier(){
    var mem = navigator.deviceMemory || 4;
    var cores = navigator.hardwareConcurrency || 4;
    var w = window.innerWidth;
    if (mem <= 2 || cores <= 2 || w < 480) return 'LOW';
    if (mem <= 4 || cores <= 4 || w < 900) return 'MEDIUM';
    return 'HIGH';
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1b. BACKGROUND VIDEO — reveal once it can play smoothly so
     there's no flash of a black/blank frame; a timeout
     guarantees it still shows even on a slow connection.
     ========================================================= */
  (function(){
    var bgVideo = document.getElementById('bg-video');
    if (!bgVideo) return;
    var revealed = false;
    function reveal(){
      if (revealed) return;
      revealed = true;
      bgVideo.classList.add('loaded');
    }
    if (bgVideo.readyState >= 3){
      reveal();
    } else {
      bgVideo.addEventListener('canplay', reveal);
      bgVideo.addEventListener('loadeddata', reveal);
      bgVideo.addEventListener('error', reveal);
    }
    setTimeout(reveal, 3000);
    var playPromise = bgVideo.play();
    if (playPromise && typeof playPromise.catch === 'function'){
      playPromise.catch(function(){});
    }
  })();

  /* =========================================================
     2. MATH HELPERS
     ========================================================= */
  function clamp01(x){ return Math.min(1, Math.max(0, x)); }
  function lerp(a,b,t){ return a + (b - a) * t; }
  function smoothstep(e0, e1, x){
    var t = clamp01((x - e0) / (e1 - e0));
    return t * t * (3 - 2 * t);
  }

  /* =========================================================
     3. EMBLEM — single template, cloned everywhere
     ========================================================= */
  function mountEmblem(container){
    var tpl = document.getElementById('emblem-template');
    container.appendChild(tpl.content.cloneNode(true));
  }

  /* =========================================================
     4. PROFILE LIST — virtualized rendering
     ========================================================= */
  var listEl = document.getElementById('profile-list');
  var currentIndex = 0;
  var lastRange = [-1, -1];
  var ITEM_HEIGHT = 98;
  var ITEM_GAP = 14;

  function buildAvatar(profile){
    var wrap = document.createElement('span');
    wrap.className = 'avatar';
    if (profile.videoAvatar){
      var video = document.createElement('video');
      video.className = 'avatar-video';
      video.dataset.src = profile.videoAvatar;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('aria-hidden', 'true');
      video.preload = 'none';
      video.addEventListener('error', function(){
        video.remove();
        if (!wrap.querySelector('img, .emblem-svg')) mountEmblem(wrap);
      }, {once:true});
      wrap.appendChild(video);
      observeLazyVideo(video);
    } else if (profile.image && profile.image !== 'emblem'){
      var img = document.createElement('img');
      img.src = profile.image;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = function(){
        wrap.innerHTML = '';
        mountEmblem(wrap);
        img.onerror = null;
      };
      wrap.appendChild(img);
    } else {
      mountEmblem(wrap);
    }
    return wrap;
  }

  /* Media is fetched only when a card approaches the viewport. */
  var mediaObserver = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var media = entry.target;
      if (entry.isIntersecting){
        if (media.dataset.src && !media.src) media.src = media.dataset.src;
        if (media.tagName === 'VIDEO'){
          var promise = media.play();
          if (promise && promise.catch) promise.catch(function(){});
        }
      } else if (media.tagName === 'VIDEO') {
        media.pause();
      }
    });
  }, {rootMargin:'160px 0px', threshold:0.01}) : null;

  function observeLazyVideo(video){
    if (mediaObserver){
      mediaObserver.observe(video);
    } else {
      video.src = video.dataset.src;
      var promise = video.play();
      if (promise && promise.catch) promise.catch(function(){});
    }
  }

  function buildItem(profile){
    var li = document.createElement('li');
    li.className = 'profile-li';

    var a = document.createElement('a');
    a.className = 'profile-item';
    if (profile.theme){
      a.classList.add('theme-' + profile.theme);
    }
    a.href = profile.url;
    a.setAttribute('aria-label', profile.name);

    if (profile.video){
      a.classList.add('has-bg-video');
      var bgVideo = document.createElement('video');
      bgVideo.className = 'card-bg-video';
      bgVideo.dataset.src = profile.video;
      bgVideo.preload = 'none';
      bgVideo.autoplay = true;
      bgVideo.loop = true;
      bgVideo.muted = true;
      bgVideo.defaultMuted = true;
      bgVideo.playsInline = true;
      bgVideo.setAttribute('aria-hidden', 'true');
      a.appendChild(bgVideo);
      observeLazyVideo(bgVideo);
    }

    a.appendChild(buildAvatar(profile));

    var textWrap = document.createElement('span');
    textWrap.className = 'profile-text';

    var name = document.createElement('span');
    name.className = 'profile-name';
    name.textContent = profile.name;
    textWrap.appendChild(name);

    if (profile.role){
      var role = document.createElement('span');
      role.className = 'profile-role';
      role.textContent = profile.role;
      textWrap.appendChild(role);
    }

    a.appendChild(textWrap);

    var chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '\u203A';
    a.appendChild(chevron);

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches){
      a.addEventListener('pointermove', function(e){
        var rect = a.getBoundingClientRect();
        a.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        a.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
      }, {passive:true});
    }

    a.addEventListener('touchstart', function(){
      a.classList.add('pressed');
    }, {passive:true});

    a.addEventListener('touchend', function(){
      a.classList.remove('pressed');
    });

    a.addEventListener('touchcancel', function(){
      a.classList.remove('pressed');
    });

    li.appendChild(a);
    return li;
  }

  function estimateIndex(){
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    var listTop = listEl.getBoundingClientRect().top + scrollTop;
    var rel = Math.max(0, scrollTop - listTop);
    return Math.max(0, Math.floor(rel / (ITEM_HEIGHT + ITEM_GAP)));
  }

  function computeRange(){
    var total = dataSource.length();
    var start = Math.max(0, currentIndex - CONFIG.buffer);
    var end = Math.min(total - 1, currentIndex + CONFIG.buffer);
    return [start, end];
  }

  function measureItemHeight(){
    var li = listEl.querySelector('.profile-li');
    if (li){
      var h = li.getBoundingClientRect().height;
      if (h > 0) ITEM_HEIGHT = h;
    }
  }

  function renderList(force){
    var total = dataSource.length();

    if (total <= 0){
      listEl.innerHTML = '';
      listEl.style.paddingTop = '0px';
      listEl.style.paddingBottom = '0px';
      return;
    }

    var range = computeRange();
    var start = range[0], end = range[1];

    if (!force && start === lastRange[0] && end === lastRange[1]) return;

    lastRange = [start, end];

    listEl.style.paddingTop = (start * (ITEM_HEIGHT + ITEM_GAP)) + 'px';
    listEl.style.paddingBottom = ((total - end - 1) * (ITEM_HEIGHT + ITEM_GAP)) + 'px';

    var frag = document.createDocumentFragment();

    for (var i = start; i <= end; i++){
      frag.appendChild(buildItem(dataSource.get(i)));
    }

    listEl.innerHTML = '';
    listEl.appendChild(frag);
    measureItemHeight();
  }

  var scrollTicking = false;

  window.addEventListener('scroll', function(){
    if (!scrollTicking){
      requestAnimationFrame(function(){
        currentIndex = estimateIndex();
        renderList(false);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, {passive:true});

  window.addEventListener('resize', function(){
    measureItemHeight();
  });

  /* =========================================================
     5. INTRO SEQUENCE
     ========================================================= */
  var introEl = document.getElementById('intro');
  var skipBtn = document.getElementById('skip-btn');
  var appEl = document.getElementById('app');

  function spawnIntroParticles(){
    if (reducedMotion) return;

    var container = document.getElementById('intro-particles');
    var count = 42;

    for (var i = 0; i < count; i++){
      var p = document.createElement('span');
      p.className = 'particle';
      p.style.left = (Math.random() * 100) + '%';
      p.style.top = (Math.random() * 100) + '%';
      p.style.animationDelay = (Math.random() * 2.2) + 's';
      p.style.animationDuration = (2 + Math.random() * 2) + 's';
      container.appendChild(p);
    }
  }

  function finishIntro(){
    introEl.classList.add('fade-out');

    setTimeout(function(){
      if (introEl.parentNode) introEl.parentNode.removeChild(introEl);
      appEl.removeAttribute('aria-hidden');
      renderList(true);
    }, 420);
  }

  function runIntro(){
    var seen = sessionStorage.getItem('alphaIntroSeen');

    if (seen){
      if (introEl.parentNode) introEl.parentNode.removeChild(introEl);
      appEl.removeAttribute('aria-hidden');
      renderList(true);
      return;
    }

    sessionStorage.setItem('alphaIntroSeen', '1');

    mountEmblem(
      document.getElementById('intro-emblem-wrap')
    );

    spawnIntroParticles();

    if (reducedMotion){
      introEl.classList.add('reduced');
    } else {
      introEl.classList.add('animating');
    }

    var duration = reducedMotion ? 700 : 3000;

    var timer = setTimeout(
      finishIntro,
      duration
    );

    skipBtn.addEventListener('click', function(){
      clearTimeout(timer);
      finishIntro();
    }, {once:true});
  }

  /* =========================================================
     6. BOOTSTRAP
     ========================================================= */
  function init(){
    runIntro();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
