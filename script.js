const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
const announcer = document.querySelector("#site-announcer");

function setMenuOpen(open) {
  if (!menuToggle || !mobileNav) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  mobileNav.hidden = !open;
  body.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

document.addEventListener("click", (event) => {
  if (menuToggle?.getAttribute("aria-expanded") === "true" && !event.target.closest(".site-header")) {
    setMenuOpen(false);
  }
});

// Each project has its own HTML page and an accessible, keyboard-friendly image gallery.
document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const image = gallery.querySelector("[data-gallery-image]");
  const counter = gallery.querySelector("[data-gallery-count]");
  const thumbnails = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));
  const previous = gallery.querySelector("[data-gallery-prev]");
  const next = gallery.querySelector("[data-gallery-next]");
  let activeIndex = Math.max(0, thumbnails.findIndex((thumb) => thumb.getAttribute("aria-current") === "true"));

  if (!image || thumbnails.length === 0) return;

  function showScreen(index, scrollThumb = true) {
    activeIndex = (index + thumbnails.length) % thumbnails.length;
    const selected = thumbnails[activeIndex];
    const nextSrc = selected.dataset.src;
    const nextAlt = selected.dataset.alt || "Project screenshot";

    const sameImage = image.src === new URL(nextSrc, document.baseURI).href;
    image.alt = nextAlt;
    if (!sameImage) {
      image.classList.add("is-changing");
      image.addEventListener("load", () => image.classList.remove("is-changing"), { once: true });
      image.addEventListener("error", () => image.classList.remove("is-changing"), { once: true });
      image.src = nextSrc;
    }

    thumbnails.forEach((thumb, thumbIndex) => {
      const isCurrent = thumbIndex === activeIndex;
      thumb.setAttribute("aria-current", String(isCurrent));
      if (scrollThumb && isCurrent) {
        thumb.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
      }
    });

    if (counter) counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(thumbnails.length).padStart(2, "0")}`;
    if (announcer) announcer.textContent = `Screenshot ${activeIndex + 1} of ${thumbnails.length}: ${nextAlt}`;
  }

  thumbnails.forEach((thumb, index) => thumb.addEventListener("click", () => showScreen(index)));
  previous?.addEventListener("click", () => showScreen(activeIndex - 1));
  next?.addEventListener("click", () => showScreen(activeIndex + 1));
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showScreen(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showScreen(activeIndex + 1);
    }
  });
  showScreen(activeIndex, false);
});

// Copy the primary email on the contact page, with a visible and screen-reader response.
document.querySelectorAll("[data-copy-email]").forEach((button) => {
  button.addEventListener("click", async () => {
    const email = button.dataset.copyEmail;
    const label = button.querySelector("span");
    try {
      await navigator.clipboard.writeText(email);
      if (label) label.textContent = "Email copied";
      if (announcer) announcer.textContent = "Email address copied to clipboard.";
    } catch {
      window.location.href = `mailto:${email}`;
      if (label) label.textContent = "Opening email app";
    }
    window.setTimeout(() => {
      if (label) label.textContent = "Copy primary email";
    }, 2400);
  });
});

const yearNodes = document.querySelectorAll("[data-current-year]");
yearNodes.forEach((node) => { node.textContent = new Date().getFullYear(); });

// Progressive reveal: without JS (or when reduced motion is requested), content stays visible.
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -24px 0px" });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
  body.classList.add("js-ready");
}
