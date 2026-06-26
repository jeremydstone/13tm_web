/* ============================================================
   Shared site behaviour: mobile menu, sticky header, reveals.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close menu when a link is tapped
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Sticky header background after scrolling past hero ---------- */
  var header = document.querySelector(".site-header[data-sticky]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-fixed", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero background video: nudge autoplay on mobile ---------- */
  /* iOS often ignores the autoplay attribute even with muted+playsinline.
     Force-mute and call play(); retry once it has data and on first touch
     (a user gesture lets it play even when autoplay is blocked, e.g. Low
     Power Mode). The poster stays visible if all of that is refused. */
  var heroVideo = document.querySelector(".hero__media video");
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.setAttribute("muted", "");
    heroVideo.playsInline = true;
    var playHero = function () {
      var p = heroVideo.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    };
    playHero();
    heroVideo.addEventListener("canplay", playHero, { once: true });
    document.addEventListener("touchstart", playHero, { once: true, passive: true });
  }

  /* Helper used by other scripts to register newly-added reveal nodes */
  window.__revealObserve = function (nodes) {
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io2 = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    nodes.forEach(function (el) { io2.observe(el); });
  };
})();
