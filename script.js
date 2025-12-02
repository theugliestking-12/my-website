// Smooth scroll to contact section
document.getElementById("cta").addEventListener("click", function () {
    document.getElementById("contact-section").scrollIntoView({
        behavior: "smooth"
    });
});


// Navbar toggle for mobile
const toggleBtn = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

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
