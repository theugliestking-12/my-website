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
