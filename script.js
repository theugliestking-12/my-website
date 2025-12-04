// Smooth scroll to contact section (only if #cta exists)
const ctaBtn = document.getElementById("cta");
if (ctaBtn) {
  ctaBtn.addEventListener("click", function () {
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
}

// Navbar toggle for mobile
const toggleBtn = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

// defensive checks (in case structure changes)
if (toggleBtn && navLinks) {
  toggleBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");

    // Update button aria-expanded
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true" || false;
    toggleBtn.setAttribute("aria-expanded", !expanded);
  });

  // Close mobile menu when a nav link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Backdrop element for mobile menu (created dynamically)
  let navBackdrop = document.createElement('div');
  navBackdrop.className = 'nav-backdrop';
  document.body.appendChild(navBackdrop);

  // toggle backdrop together with nav menu
  function setNavOpen(open) {
    if (open) {
      navLinks.classList.add('open');
      navBackdrop.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      navLinks.classList.remove('open');
      navBackdrop.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  toggleBtn.addEventListener('click', () => {
    setNavOpen(!navLinks.classList.contains('open'));
  });

  // clicking the dark backdrop closes the menu
  navBackdrop.addEventListener('click', () => setNavOpen(false));

  // close menu automatically when window is resized above mobile width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) setNavOpen(false);
  });
}

// ---------------------- Services Tab Logic ----------------------
// Accessible tab behavior: click, Enter/Space, and Arrow/Home/End navigation
(function initServiceTabs() {
  const tabs = Array.from(document.querySelectorAll('.service-tab'));
  const panels = Array.from(document.querySelectorAll('.service-panel'));
  const tablist = document.querySelector('[role="tablist"]');
  const animationArea = document.getElementById('service-animation');

  if (!tabs.length || !panels.length || !tablist) {
    // nothing to do if markup is missing
    return;
  }

  // Helper: activate a given tab element
  function activateTab(tab, setFocus = true) {
    // Deactivate all tabs & hide panels
    tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.classList.remove('is-active');
      t.blur && t.blur();
    });

    panels.forEach(p => {
      p.hidden = true;
      p.setAttribute('aria-hidden', 'true');
    });

    // Activate selected
    tab.setAttribute('aria-selected', 'true');
    tab.classList.add('is-active');

    // Show corresponding panel by aria-controls (id)
    const panelId = tab.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (panel) {
      panel.hidden = false;
      panel.setAttribute('aria-hidden', 'false');
      if (setFocus) panel.focus && panel.focus();
    }

    // Dispatch a custom event with service id (useful to hook animations later)
    const serviceId = tab.dataset.service || null;
    window.dispatchEvent(new CustomEvent('serviceChange', {
      detail: { id: serviceId }
    }));

    // Optionally update animation area aria (it's a placeholder for now)
    if (animationArea) {
      animationArea.setAttribute('data-active-service', serviceId || '');
    }
  }

  // Keyboard navigation helpers
  function focusTabByIndex(index) {
    const wrapped = (index + tabs.length) % tabs.length;
    tabs[wrapped].focus();
  }

  function findTabIndex(tab) {
    return tabs.indexOf(tab);
  }

  // Click and key listeners for each tab
  tabs.forEach((tab, i) => {
    // Ensure tab has correct attributes (defensive)
    tab.setAttribute('role', 'tab');
    if (!tab.hasAttribute('tabindex')) {
      // only the selected tab should be in tab order initially
      const selected = tab.getAttribute('aria-selected') === 'true';
      tab.setAttribute('tabindex', selected ? '0' : '-1');
    }

    tab.addEventListener('click', (e) => {
      activateTab(tab, false);
      // keep focus on the clicked tab
      tab.focus();
      // ensure correct tabindex values
      tabs.forEach(t => t.setAttribute('tabindex', t === tab ? '0' : '-1'));
      e.preventDefault();
    });

    tab.addEventListener('keydown', (e) => {
      const key = e.key;

      switch (key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          focusTabByIndex(i - 1);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          focusTabByIndex(i + 1);
          break;
        case 'Home':
          e.preventDefault();
          focusTabByIndex(0);
          break;
        case 'End':
          e.preventDefault();
          focusTabByIndex(tabs.length - 1);
          break;
        case 'Enter':
        case ' ':
        case 'Spacebar': // older browsers
          e.preventDefault();
          activateTab(tab, false);
          tabs.forEach(t => t.setAttribute('tabindex', t === tab ? '0' : '-1'));
          break;
        default:
          break;
      }
    });

    // When any tab receives focus, make it reachable via keyboard tab order
    tab.addEventListener('focus', () => {
      tabs.forEach(t => t.setAttribute('tabindex', t === tab ? '0' : '-1'));
    });
  });

  // Initialize: ensure only one active tab/panel
  const initialTab = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  activateTab(initialTab, false);
  tabs.forEach(t => t.setAttribute('tabindex', t === initialTab ? '0' : '-1'));

  // Expose a simple API for other scripts (optional)
  window.servicesTabs = {
    activate: (serviceId) => {
      const t = tabs.find(x => x.dataset.service === serviceId);
      if (t) activateTab(t, true);
    },
    getActive: () => {
      const active = tabs.find(t => t.getAttribute('aria-selected') === 'true');
      return active ? active.dataset.service : null;
    }
  };
})();
