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

