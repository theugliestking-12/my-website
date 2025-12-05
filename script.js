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

/* ================= Robust Discord PNG animation (visibility aware) ================= */
(function robustDiscordAnim() {
  const img = document.querySelector(".discord-img");
  if (!img) return;

  // Respect reduced-motion preference
  const mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq && mq.matches) {
    img.classList.remove("is-animated");
    return;
  }

  function start() {
    img.classList.add("is-animated");
  }
  function stop() {
    img.classList.remove("is-animated");
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.25) start();
          else stop();
        });
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );
    io.observe(img);
    // cleanup on unload
    window.addEventListener("beforeunload", () => io.disconnect());
  } else {
    // fallback: always animate if observer not supported
    start();
  }
})();

/* ================= Fallback: ensure discord animation runs =================
   Appends .is-animated to any .discord-img if observer didn't add it.
   Safe (idempotent) and respects reduced-motion via CSS media query.
*/
(function ensureDiscordAnimated() {
  function apply() {
    const imgs = document.querySelectorAll('.discord-img');
    imgs.forEach(img => {
      if (!img) {
        return;
      }
      if (!img.classList.contains('is-animated')) {
        img.classList.add('is-animated');
        // debug log — remove if you don't want console messages
        console.log('[dr-laptop] forced .is-animated on .discord-img');
      }
    });
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }

  // second attempt in case the image is injected/loaded late (OneDrive/slow file)
  setTimeout(apply, 1000);
})();

/* ================= Manual rAF rotation + neon brightness loop for .discord-img
   Fallback/guarantee: directly sets inline transform + filter every frame.
   Respects prefers-reduced-motion.
*/
(function discordManualSpin() {
  const img = document.querySelector('.discord-img');
  if (!img) return;

  // Respect reduced-motion preference
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // ensure a baseline is present but do not animate
    img.style.transform = 'rotate(0deg)';
    img.style.transition = 'transform 160ms linear';
    return;
  }

  // Controls
  const LOOP_PERIOD_MS = 4200;    // full bright→dim→bright cycle (ms)
  const BASE_ANGULAR_SPEED = 0.15; // base radians/sec (slow)
  const SPEED_AMPLITUDE = 1.7;     // added when glow is dim (makes it much faster)

  // We'll track a rotation angle in radians and update transform each frame
  let angle = 0;
  let last = performance.now();

  // helper: ease in-out for smooth bright/dim shape
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function frame(now) {
    const dt = (now - last) / 1000; // seconds
    last = now;

    // phase in [0,1] repeating
    const phase = ((now % LOOP_PERIOD_MS) / LOOP_PERIOD_MS); // 0..1
    // brightness factor: 0 = dim, 1 = bright (we want brightness oscillation)
    const bright = easeInOut( (Math.sin(phase * Math.PI * 2) + 1) / 2 );

    // map brightness -> angular speed (bright => slower, dim => faster)
    // inverse mapping: speed = base + amplitude * (1 - bright)
    const angularSpeed = BASE_ANGULAR_SPEED + SPEED_AMPLITUDE * (1 - bright); // radians/sec

    // update angle (radians)
    angle += angularSpeed * dt * 3.14159; // scale so speed feels right; tweak if needed

    // write transform (rotation + slight scale for life)
    const deg = (angle * 180 / Math.PI) % 360;
    const scale = 1 + 0.025 * (0.5 + 0.5 * Math.sin(phase * Math.PI * 2)); // tiny breathing
    img.style.transform = `rotate(${deg}deg) scale(${scale})`;

    // update filter to reflect neon brightness (stronger when bright)
    // You can tune the rgba values to match your neon colors
    const whiteInt = 0.6 + 0.9 * bright; // 0.6..1.5
    const cyanInt  = 0.35 + 1.05 * bright; // 0.35..1.4
    const purpleInt= 0.2 + 0.9 * bright; // 0.2..1.1

    // set drop-shadow chain: inner white, outer cyan, outer purple
    img.style.filter =
      `drop-shadow(0 0 ${4 * whiteInt}px rgba(255,255,255,${0.9 * bright + 0.25})) ` +
      `drop-shadow(0 0 ${8 * cyanInt}px rgba(0,200,255,${0.75 * bright + 0.12})) ` +
      `drop-shadow(0 0 ${16 * purpleInt}px rgba(120,0,255,${0.45 * bright + 0.06}))`;

    // schedule next frame
    requestAnimationFrame(frame);
  }

  // start loop
  last = performance.now();
  requestAnimationFrame(frame);
})();
