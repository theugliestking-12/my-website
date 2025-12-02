// script.js — cleaned & safe

// Smooth scroll to contact section (safe guard)
const cta = document.getElementById("cta");
if (cta) {
  cta.addEventListener("click", () => {
    const el = document.getElementById("contact-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  });
}

// Navbar elements (may be null on pages without nav)
const toggleBtn = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

// Create/attach a single backdrop element (only once)
let navBackdrop = document.querySelector(".nav-backdrop");
if (!navBackdrop) {
  navBackdrop = document.createElement("div");
  navBackdrop.className = "nav-backdrop";
  document.body.appendChild(navBackdrop);
}

// Helper that opens/closes nav + backdrop in one place
function setNavOpen(open) {
  if (!navLinks || !toggleBtn || !navBackdrop) return;
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

// Only attach listeners if toggle exists
if (toggleBtn && navLinks) {
  // Toggle from button — uses the single helper
  toggleBtn.addEventListener("click", () => {
    setNavOpen(!navLinks.classList.contains("open"));
  });

  // Close menu when any nav link is clicked (mobile)
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  // Backdrop click closes the menu
  navBackdrop.addEventListener("click", () => setNavOpen(false));

  // Auto-close menu when resizing above mobile width
  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) setNavOpen(false);
  });
}
