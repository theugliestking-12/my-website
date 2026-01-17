/*!
Copyright (c) 2026 Martin Laxenaire
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
*/



/* ================= Smooth scroll for #cta (if present) ================= */
const ctaBtn = document.getElementById("cta");
if (ctaBtn) {
  ctaBtn.addEventListener("click", function () {
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

/* ================= Navbar toggle & backdrop (mobile) ================= */
const toggleBtn = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (toggleBtn && navLinks) {
  // create backdrop once
  let navBackdrop = document.createElement("div");
  navBackdrop.className = "nav-backdrop";
  document.body.appendChild(navBackdrop);

  function setNavOpen(open) {
    if (open) {
      navLinks.classList.add("open");
      navBackdrop.classList.add("open");
      toggleBtn.setAttribute("aria-expanded", "true");
    } else {
      navLinks.classList.remove("open");
      navBackdrop.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  }

  // toggle on click
  toggleBtn.addEventListener("click", () => {
    setNavOpen(!navLinks.classList.contains("open"));
  });

  // close mobile menu when a nav link is clicked
  document.querySelectorAll(".nav-links a").forEach((link) =>
    link.addEventListener("click", () => setNavOpen(false))
  );

  // clicking backdrop closes menu
  navBackdrop.addEventListener("click", () => setNavOpen(false));

  // ensure menu closes when resizing above mobile width
  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) setNavOpen(false);
  });
}

/* ================= Services Tab Logic (accessible tabs) ================= */
(function initServiceTabs() {
  const tabs = Array.from(document.querySelectorAll(".service-tab"));
  const panels = Array.from(document.querySelectorAll(".service-panel"));
  const tablist = document.querySelector('[role="tablist"]');
  const animationArea = document.getElementById("service-animation");

  if (!tabs.length || !panels.length || !tablist) return;

  // Activate a given tab + panel
  function activateTab(tab, setFocus = true) {
    // deactivate all tabs & hide panels
    tabs.forEach((t) => {
      t.setAttribute("aria-selected", "false");
      t.classList.remove("is-active");
      t.setAttribute("tabindex", "-1");
    });

    panels.forEach((p) => {
      p.hidden = true;
      p.setAttribute("aria-hidden", "true");
    });

    // activate selected tab
    tab.setAttribute("aria-selected", "true");
    tab.classList.add("is-active");
    tab.setAttribute("tabindex", "0");

    // show corresponding panel
    const panelId = tab.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    if (panel) {
      panel.hidden = false;
      panel.setAttribute("aria-hidden", "false");

      /* ---------------- Fade-up animation trigger ---------------- */
      panel.classList.remove("fade-up"); // reset
      // force reflow to restart animation reliably
      // eslint-disable-next-line no-unused-expressions
      void panel.offsetWidth;
      panel.classList.add("fade-up");
      /* ---------------------------------------------------------- */

      if (setFocus && typeof panel.focus === "function") {
        panel.focus();
      }
    }

    // dispatch serviceChange event for future use (animations, tracking, etc.)
    const serviceId = tab.dataset.service || null;
    window.dispatchEvent(
      new CustomEvent("serviceChange", {
        detail: { id: serviceId },
      })
    );

    // update animation area attribute (placeholder)
    if (animationArea) animationArea.setAttribute("data-active-service", serviceId || "");
  }

  // keyboard navigation helpers
  function focusTabByIndex(idx) {
    const wrapped = (idx + tabs.length) % tabs.length;
    tabs[wrapped].focus();
  }

  // Initialize attributes and listeners on each tab
  tabs.forEach((tab, i) => {
    tab.setAttribute("role", "tab");
    const selected = tab.getAttribute("aria-selected") === "true";
    tab.setAttribute("tabindex", selected ? "0" : "-1");

    tab.addEventListener("click", (e) => {
      e.preventDefault();
      activateTab(tab, false);
      tab.focus();
    });

    tab.addEventListener("keydown", (e) => {
      const key = e.key;
      switch (key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          focusTabByIndex(i - 1);
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          focusTabByIndex(i + 1);
          break;
        case "Home":
          e.preventDefault();
          focusTabByIndex(0);
          break;
        case "End":
          e.preventDefault();
          focusTabByIndex(tabs.length - 1);
          break;
        case "Enter":
        case " ":
        case "Spacebar": // legacy
          e.preventDefault();
          activateTab(tab, false);
          tab.focus();
          break;
        default:
          break;
      }
    });

    tab.addEventListener("focus", () => {
      // ensure only focused tab is in tab order
      tabs.forEach((t) => t.setAttribute("tabindex", t === tab ? "0" : "-1"));
    });
  });

  // ensure panels are focusable (if not already) — defensive
  panels.forEach((p) => {
    if (!p.hasAttribute("tabindex")) p.setAttribute("tabindex", "-1");
  });

  // initial activation
  const initialTab = tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
  activateTab(initialTab, false);
  tabs.forEach((t) => t.setAttribute("tabindex", t === initialTab ? "0" : "-1"));

  // expose small API
  window.servicesTabs = {
    activate: (serviceId) => {
      const t = tabs.find((x) => x.dataset.service === serviceId);
      if (t) activateTab(t, true);
    },
    getActive: () => {
      const active = tabs.find((t) => t.getAttribute("aria-selected") === "true");
      return active ? active.dataset.service : null;
    },
  };
})();







document.addEventListener("DOMContentLoaded", () => {
  const copyBtn = document.getElementById("copyDiscord");
  const nameSpan = document.getElementById("discordName");

  copyBtn.addEventListener("click", async () => {
    try {
      const text = nameSpan.textContent.trim();
      await navigator.clipboard.writeText(text);

      // Feedback
      copyBtn.innerText = "Copied!";
      setTimeout(() => (copyBtn.innerText = "Copy"), 1200);
    } catch (err) {
      console.error("Copy failed:", err);
      copyBtn.innerText = "Error";
      setTimeout(() => (copyBtn.innerText = "Copy"), 1200);
    }
  });
});

/* =============== Custom overlay scrollbar script ===============
   Creates .custom-scrollbar, updates thumb size/position, enables drag-to-scroll.
   Drop at end of script.js (after DOMContent loaded scripts).
*/

(function createCustomScrollbar() {
  // bail early if environment doesn't support required APIs
  if (!document.body) return;

  // create DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-scrollbar';
  wrapper.innerHTML = '<div class="track"><div class="thumb" aria-hidden="true"></div></div>';
  document.body.appendChild(wrapper);

  const track = wrapper.querySelector('.track');
  const thumb = wrapper.querySelector('.thumb');

  // compute sizes and update thumb
  function updateThumb() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const clientH = window.innerHeight || doc.clientHeight;
    const scrollH = Math.max(doc.scrollHeight || document.body.scrollHeight, document.body.scrollHeight);

    // avoid division by zero
    if (scrollH <= clientH) {
      thumb.style.display = 'none';
      return;
    } else {
      thumb.style.display = '';
    }

    const trackH = track.clientHeight;
    // thumb height proportional to visible area (min 28px)
    const thumbH = Math.max((clientH / scrollH) * trackH, 28);
    const maxThumbTop = trackH - thumbH;
    const scrollRatio = scrollTop / (scrollH - clientH);
    const thumbTop = Math.round(scrollRatio * maxThumbTop);

    thumb.style.height = thumbH + 'px';
    thumb.style.transform = `translateY(${thumbTop}px)`;
  }

  // update on load + resize + scroll
  window.addEventListener('load', updateThumb, { passive: true });
  window.addEventListener('resize', updateThumb);
  window.addEventListener('scroll', updateThumb, { passive: true });

  // dragging support
  let dragging = false;
  let dragStartY = 0;
  let startThumbTop = 0;

  thumb.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragging = true;
    thumb.setPointerCapture(e.pointerId);
    dragStartY = e.clientY;
    // compute current top from transform
    const matrix = window.getComputedStyle(thumb).transform;
    let currentTop = 0;
    if (matrix && matrix !== 'none') {
      const vals = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');
      currentTop = parseFloat(vals[5]); // translateY
    } else {
      currentTop = 0;
    }
    startThumbTop = currentTop;
    thumb.style.transition = 'none';
  });

  thumb.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    e.preventDefault();
    const deltaY = e.clientY - dragStartY;
    const trackH = track.clientHeight;
    const thumbH = thumb.clientHeight;
    const maxTop = trackH - thumbH;
    let newTop = startThumbTop + deltaY;
    newTop = Math.max(0, Math.min(maxTop, newTop));

    // update visual
    thumb.style.transform = `translateY(${newTop}px)`;

    // map thumb position to page scroll
    const doc = document.documentElement;
    const clientH = window.innerHeight || doc.clientHeight;
    const scrollH = Math.max(doc.scrollHeight || document.body.scrollHeight, document.body.scrollHeight);
    const scrollRatio = newTop / maxTop;
    const newScrollTop = Math.round(scrollRatio * (scrollH - clientH));
    window.scrollTo({ top: newScrollTop, behavior: 'auto' });
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    try { thumb.releasePointerCapture && thumb.releasePointerCapture(e && e.pointerId); } catch (err) { }
    thumb.style.transition = '';
  }

  thumb.addEventListener('pointerup', endDrag);
  thumb.addEventListener('pointercancel', endDrag);
  // release globally in case pointer leaves thumb
  window.addEventListener('pointerup', endDrag);

  // click on track to jump
  track.addEventListener('click', (e) => {
    // ignore clicks that hit the thumb itself
    if (e.target === thumb) return;
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const thumbH = thumb.clientHeight;
    const trackH = track.clientHeight;
    const newTop = Math.max(0, Math.min(trackH - thumbH, clickY - thumbH / 2));
    const doc = document.documentElement;
    const clientH = window.innerHeight || doc.clientHeight;
    const scrollH = Math.max(doc.scrollHeight || document.body.scrollHeight, document.body.scrollHeight);
    const newScrollTop = Math.round((newTop / (trackH - thumbH)) * (scrollH - clientH));
    window.scrollTo({ top: newScrollTop, behavior: 'smooth' });
  });

  // initial update
  updateThumb();

  // ensure thumb updates if content changes (images or fonts load)
  const ro = new MutationObserver(updateThumb);
  ro.observe(document.body, { childList: true, subtree: true, attributes: true });
})();

/* ---------------- Custom horizontal scrollbar for .services-tabs ----------------
   - Injects a .custom-hscroll under each .services-tabs
   - Syncs thumb width/position to scrollLeft
   - Supports track click and pointer drag for smooth control
*/
(function customHScrollForTabs() {
  document.addEventListener('DOMContentLoaded', () => {
    const tabContainers = Array.from(document.querySelectorAll('.services-tabs'));
    if (!tabContainers.length) return;

    tabContainers.forEach((tabs) => {
      // create DOM
      const wrapper = document.createElement('div');
      wrapper.className = 'custom-hscroll';
      wrapper.innerHTML = '<div class="track"><div class="thumb" aria-hidden="true"></div></div>';

      // insert after the tabs container
      tabs.parentNode.insertBefore(wrapper, tabs.nextSibling);

      const track = wrapper.querySelector('.track');
      const thumb = wrapper.querySelector('.thumb');

      function updateThumb() {
        const scrollWidth = tabs.scrollWidth;
        const clientW = tabs.clientWidth;
        if (scrollWidth <= clientW) {
          // hide when no overflow
          wrapper.style.display = 'none';
          return;
        } else {
          wrapper.style.display = '';
        }

        const trackRect = track.getBoundingClientRect();
        const trackW = trackRect.width;

        // thumb width proportional to visible area
        const thumbW = Math.max((clientW / scrollWidth) * trackW, 28);
        const maxThumbLeft = trackW - thumbW;
        const scrollRatio = tabs.scrollLeft / (scrollWidth - clientW);
        const thumbLeft = Math.round(scrollRatio * maxThumbLeft);

        thumb.style.width = thumbW + 'px';
        thumb.style.transform = `translateY(-50%) translateX(${thumbLeft}px)`;
      }

      // scrolling within the tabs should update thumb
      tabs.addEventListener('scroll', updateThumb, { passive: true });

      // update on load and resize
      window.addEventListener('load', updateThumb);
      window.addEventListener('resize', updateThumb);

      // pointer dragging
      let dragging = false;
      let startX = 0;
      let startLeft = 0;

      thumb.addEventListener('pointerdown', (e) => {
        dragging = true;
        thumb.setPointerCapture(e.pointerId);
        startX = e.clientX;
        // read current translateX from transform
        const matrix = window.getComputedStyle(thumb).transform;
        startLeft = (matrix && matrix !== 'none') ? parseFloat(matrix.split(',')[4]) : 0;
        thumb.style.transition = 'none';
      });

      thumb.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const trackW = track.clientWidth;
        const thumbW = thumb.clientWidth;
        const maxLeft = trackW - thumbW;
        let newLeft = Math.max(0, Math.min(maxLeft, startLeft + dx));

        // move thumb visually
        thumb.style.transform = `translateY(-50%) translateX(${newLeft}px)`;

        // sync tabs scroll
        const scrollWidth = tabs.scrollWidth;
        const clientW = tabs.clientWidth;
        const scrollRatio = newLeft / (maxLeft || 1);
        const newScrollLeft = Math.round(scrollRatio * (scrollWidth - clientW));
        tabs.scrollLeft = newScrollLeft;
      });

      function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        try { thumb.releasePointerCapture && thumb.releasePointerCapture(e && e.pointerId); } catch (err) { }
        thumb.style.transition = '';
      }

      thumb.addEventListener('pointerup', endDrag);
      thumb.addEventListener('pointercancel', endDrag);
      window.addEventListener('pointerup', endDrag);

      // click on track to jump
      track.addEventListener('click', (e) => {
        if (e.target === thumb) return;
        const rect = track.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const thumbW = thumb.clientWidth;
        const trackW = track.clientWidth;
        const newLeft = Math.max(0, Math.min(trackW - thumbW, clickX - thumbW / 2));
        const scrollWidth = tabs.scrollWidth;
        const clientW = tabs.clientWidth;
        const newScrollLeft = Math.round((newLeft / (trackW - thumbW)) * (scrollWidth - clientW));
        tabs.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      });

      // initial update and observe for changes (font load or content changes)
      updateThumb();
      const mo = new MutationObserver(updateThumb);
      mo.observe(tabs, { childList: true, subtree: true, characterData: true, attributes: true });
    });
  });
})();

/* ---------------animation place holder controller----------------*/

/* --------------- animation placeholder controller ---------------- */

(function initServiceVideos() {
  const idleVideo = document.getElementById("idleVideo");
  if (idleVideo) idleVideo.loop = true;


  const videos = Array.from(
    document.querySelectorAll("#service-animation video[data-service]")
  );


  if (!videos.length) return;

  let activeService = null;

  function showVideo(video) {
    // hide idle
    if (idleVideo) {
      idleVideo.pause();
      idleVideo.classList.remove("is-visible");
    }

    video.classList.add("is-visible");
    video.currentTime = 0;
    video.play().catch(() => { });
  }

  function showIdle() {
    if (!idleVideo) return;

    // hide all service videos (hide FIRST)
    videos.forEach(v => {
      v.classList.remove("is-visible");
    });

    // reset AFTER hide
    setTimeout(() => {
      videos.forEach(v => {
        v.pause();
        v.currentTime = 0;
      });
    }, 0);


    activeService = null;
    idleVideo.classList.add("is-visible");
    idleVideo.currentTime = 0;
    idleVideo.play().catch(() => { });
  }

  window.addEventListener("serviceChange", (e) => {
    if (!window.__animationsReady) return;

    const nextService = e.detail.id;

    // clicking active tab again → idle
    if (nextService === activeService) {
      showIdle();
      return;
    }

    // reset everything first
    videos.forEach(v => {
      v.pause();
      v.currentTime = 0;
      v.classList.remove("is-visible");
    });

    if (!nextService) {
      showIdle();
      return;
    }

    const nextVideo = videos.find(v => v.dataset.service === nextService);

    if (nextVideo) {
      activeService = nextService;
      showVideo(nextVideo);
    } else {
      showIdle();
    }
  });

  // show idle ONLY after animations are ready
  const wait = setInterval(() => {
    if (!window.__animationsReady) return;
    clearInterval(wait);
    showIdle();
  }, 50);

})();





/* --------------- animation fan controller ---------------- */

// (function initFanSequence() {
//   const intro = document.getElementById("fanIntroVideo");
//   const spin = document.getElementById("fanSpinVideo");

//   if (!intro || !spin) return;

//   // 🔁 loop ONLY the spin video
//   spin.loop = true;

//   // when intro ends, start spin
//   intro.addEventListener("ended", () => {
//     intro.pause();
//     intro.currentTime = 0;
//     intro.hidden = true;

//     spin.hidden = false;
//     spin.currentTime = 0;
//     spin.play().catch(() => { });
//   });

//   // when service switches away, stop both
//   window.addEventListener("serviceChange", (e) => {
//     if (e.detail.id !== "fan-cleaning") {
//       [intro, spin].forEach(v => {
//         v.pause();
//         v.currentTime = 0;
//         v.hidden = true;
//       });
//     }
//   });
// })();


/* --------------- health pause point ---------------- */

// (function initHealthPausePoint() {
//   const healthVideo = document.querySelector(
//     '#service-animation video[data-service="health-check"]'
//   );
//   if (!healthVideo) return;

//   const PAUSE_TIME = 2.6; // seconds
//   let paused = false;

//   healthVideo.addEventListener("timeupdate", () => {
//     if (!paused && healthVideo.currentTime >= PAUSE_TIME) {
//       healthVideo.pause();
//       healthVideo.currentTime = PAUSE_TIME;
//       paused = true;
//     }
//   });

// reset when switching away
//   window.addEventListener("serviceChange", (e) => {
//     if (e.detail.id !== "health-check") {
//       paused = false;
//     }
//   });
// })();


/* --------------- animation asset loader ---------------- */

(function initAnimationAssetLoader() {
  const videos = Array.from(
    document.querySelectorAll('#service-animation video')
  );
  const loader = document.getElementById("animation-loader");

  if (!videos.length || !loader) return;

  let loadedCount = 0;
  const total = videos.length;

  function onVideoReady() {
    loadedCount++;
    if (loadedCount >= total) {
      loader.classList.add("hidden");
      window.__animationsReady = true;

    }
  }



  videos.forEach(video => {
    // ensure preload
    video.preload = "auto";

    if (video.readyState >= 2) {
      onVideoReady();
    } else {
      video.addEventListener("loadeddata", onVideoReady, { once: true });
      video.addEventListener("error", onVideoReady, { once: true });
    }
  });
})();

/* --------------- video bootstrap (one-time) ---------------- */
(function initVideoBootstrap() {
  window.addEventListener("load", () => {
    const healthVideo = document.querySelector(
      '#service-animation video[data-service="health-check"]'
    );
    const idleVideo = document.getElementById("idleVideo");

    if (!healthVideo || !idleVideo) return;

    // wait until animations are unlocked
    const wait = setInterval(() => {
      if (!window.__animationsReady) return;

      clearInterval(wait);

      // silently initialize health video
      healthVideo.muted = true;
      healthVideo.play().then(() => {
        healthVideo.pause();
        healthVideo.currentTime = 0;
        // healthVideo.hidden = true;

        // ensure idle is visible
        idleVideo.hidden = false;
        idleVideo.play().catch(() => { });
      }).catch(() => {
        // even if play fails, keep idle running
        idleVideo.hidden = false;
        idleVideo.play().catch(() => { });
      });

    }, 50);
  });
})();

/* --------------- fan intro → spin controller ---------------- */
let fanIntroCompletedNaturally = false;

(function initFanSequence() {
  const intro = document.getElementById("fanIntroVideo");
  const spin = document.getElementById("fanSpinVideo");

  if (!intro || !spin) return;

  // spin should loop
  spin.loop = true;

  intro.addEventListener("timeupdate", () => {
    if (intro.duration && intro.currentTime >= intro.duration - 0.05) {
      // stop intro BEFORE last frame paints
      intro.addEventListener("timeupdate", () => {
        if (intro.duration && intro.currentTime >= intro.duration - 0.05) {

          // JUST hide intro — do NOT reset it
          intro.classList.remove("is-visible");

          // spin is already playing / visible logic handled elsewhere
        }
      });

      intro.classList.remove("is-visible");

      // prepare spin
      spin.currentTime = 0;

      // start playback FIRST (while still hidden)
      spin.play().catch(() => { });

      // make visible on next frame so motion is already happening
      requestAnimationFrame(() => {
        spin.classList.add("is-visible");
      });

    }
  });


  // when switching away from fan service, stop both
  window.addEventListener("serviceChange", (e) => {
    if (e.detail.id !== "fan-cleaning") {
      [intro, spin].forEach(v => {
        v.pause();
        v.currentTime = 0;
        v.classList.remove("is-visible");
      });
    }
  });
})();

// optimization for low end  by completely removing riplle effects .
const isLowEndDevice =
  navigator.hardwareConcurrency <= 4 ||
  navigator.deviceMemory <= 4;

  
if (!isLowEndDevice) {

// Water overlay setup (Phase 1)
const waterCanvas = document.getElementById("water-overlay");
const waterCtx = waterCanvas.getContext("2d");

function resizeWaterCanvas() {
  waterCanvas.width = window.innerWidth;
  waterCanvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeWaterCanvas);
resizeWaterCanvas();



// Ripple system (Phase 2)
let lastRippleTime = 0;
const RIPPLE_INTERVAL = 20; // ms (you can tweak later)

const ripples = [];

function createRipple(x, y) {
  ripples.push({
    x,
    y,
    radius: 0,
    alpha: 0.5,      // subtle
    speed: 0.8        // expansion speed
  });
}

window.addEventListener("mousemove", (e) => {
  const now = performance.now();

  if (now - lastRippleTime < RIPPLE_INTERVAL) return;

  lastRippleTime = now;
  createRipple(e.clientX, e.clientY);
});

function drawRipples() {
  waterCtx.clearRect(0, 0, waterCanvas.width, waterCanvas.height);

  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];

    // subtle bloom (glow)
    waterCtx.shadowColor = "rgba(255, 255, 255, 1)";
    waterCtx.shadowBlur = 5;
    


    // highlight ring
    waterCtx.beginPath();
    waterCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    waterCtx.strokeStyle = `rgba(255, 255, 255, ${r.alpha})`;
    waterCtx.lineWidth = 1;
    waterCtx.stroke();

    // shadow ring (slightly offset for refraction illusion)
    waterCtx.beginPath();
    waterCtx.arc(r.x, r.y, r.radius + 2, 0, Math.PI * 2);
    waterCtx.strokeStyle = `rgba(0, 0, 0, ${r.alpha * 0.6})`;
    waterCtx.lineWidth = 1;
    waterCtx.stroke();

    // reset bloom so it doesn't affect next frame
    waterCtx.shadowBlur = 0;



    // update ripple
    r.radius += r.speed;
    r.alpha -= 0.005;

    // remove when invisible
    if (r.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }

  requestAnimationFrame(drawRipples);
}

drawRipples();
}




const cursor = document.getElementById("custom-cursor");

window.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

// Pop out when leaving the browser window
window.addEventListener("mouseleave", () => {
  cursor.classList.add("is-hidden");
});

// Pop back in when re-entering
window.addEventListener("mouseenter", () => {
  cursor.classList.remove("is-hidden");
});

// Scroll-based vignette control
const vignette = document.querySelector(".scroll-vignette");

function updateVignette() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  const topStrength = Math.min(scrollTop / 150, 0.9);
  const bottomStrength = Math.min((docHeight - scrollTop) / 150, 0.9);

  vignette.style.setProperty("--top-strength", topStrength.toFixed(2));
  vignette.style.setProperty("--bottom-strength", bottomStrength.toFixed(2));
}

window.addEventListener("scroll", updateVignette);
updateVignette();






/* ---------------clear----------------*/
 
// ------last block ---------

// ===============================
// Page Loader control
// ===============================
window.addEventListener("load", () => {
  const loader = document.getElementById("page-loader");
  if (!loader) return;

  // short delay so the fade feels intentional
  setTimeout(() => {
    loader.classList.add("is-hidden");
  }, 800);

  // remove from DOM after fade-out
  setTimeout(() => {
    loader.remove();
  }, 1200);
});

/* ===============================
   Audio system (BG + Click)
   =============================== */

const bgMusic = document.getElementById("bg-music");
const clickSound = document.getElementById("click-sound");

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  bgMusic.volume = 0.25;   // subtle background
  bgMusic.play().catch(() => {});

  clickSound.volume = 0.35;

  window.removeEventListener("click", unlockAudio);
  window.removeEventListener("keydown", unlockAudio);
  window.removeEventListener("touchstart", unlockAudio);
}

// unlock on first interaction (browser rule)
window.addEventListener("click", unlockAudio);
window.addEventListener("keydown", unlockAudio);
window.addEventListener("touchstart", unlockAudio);

// click sound on mouse clicks (after unlock)
window.addEventListener("mousedown", () => {
  if (!audioUnlocked) return;
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
});
const MAX_RIPPLES = 8;


const rippleLayer = document.getElementById("ambient-ripple");

function spawnAmbientRipple() {
  if (rippleLayer.children.length >= MAX_RIPPLES) return;

  const ripple = document.createElement("div");
  ripple.className = "ambient-ripple";

  const size = 140 + Math.random() * 120;
  ripple.style.width = ripple.style.height = `${size}px`;

  ripple.style.left = `${Math.random() * 100}%`;
  ripple.style.top = `${Math.random() * 100}%`;

  rippleLayer.appendChild(ripple);

  ripple.addEventListener("animationend", () => {
    ripple.remove();
  });
}


function startAmbientRipples() {
  spawnAmbientRipple();

const next = 500 + Math.random() * 1000;
  setTimeout(startAmbientRipples, next);
}

startAmbientRipples();

if (isLowEndDevice) {
  const canvas = document.getElementById("water-overlay");
  if (canvas) canvas.style.display = "none";
}

let musicStarted = false;

function startBackgroundMusic() {
  if (musicStarted) return;

  const bgMusic = document.getElementById("bg-music");
  if (!bgMusic) return;

  bgMusic.volume = 0.4;

  bgMusic.play().then(() => {
    musicStarted = true;
  }).catch(() => {
    // ignored — user hasn’t interacted yet
  });
}

// Start music on first interaction
document.addEventListener("click", startBackgroundMusic, { once: true });
document.addEventListener("touchstart", startBackgroundMusic, { once: true });


/* ---------new ripple overlay------------ */

