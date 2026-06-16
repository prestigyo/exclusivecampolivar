/* =================================================================
   Alcalá Hills · Exclusive Campolivar
   Shared behaviour — nav scroll, scroll reveals, hero entrance,
   subtle parallax, language-toggle stub.
   Vanilla JS. No libraries.
   ================================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------------------
     1. Navigation — transparent over hero, solid after 60px.
        Interior pages opt out by adding the .nav--solid class.
     --------------------------------------------------------------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav || nav.classList.contains("nav--solid")) return;

    var ticking = false;

    function update() {
      if (window.scrollY > 60) {
        nav.classList.add("is-scrolled");
      } else {
        nav.classList.remove("is-scrolled");
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ---------------------------------------------------------------
     2. Scroll reveals — headings, cards, images, gold lines.
        One observer drives every [data-reveal] / .fade-img /
        .gold-line.is-draw element.
     --------------------------------------------------------------- */
  function initReveals() {
    var targets = document.querySelectorAll(
      "[data-reveal], .fade-img, .gold-line.is-draw"
    );
    if (!targets.length) return;

    // No IntersectionObserver (or reduced motion): show everything.
    if (prefersReduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     3. Hero entrance — settle + staggered text fade-in on load.
        Delays are declared in markup via --enter-delay.
     --------------------------------------------------------------- */
  function initHero() {
    var hero = document.querySelector(".hero");
    if (!hero) return;

    // Trigger after first paint so the transitions actually run.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        hero.classList.add("is-loaded");
      });
    });
  }

  /* ---------------------------------------------------------------
     4. Hero parallax — subtle, capped at 80px of travel.
        Skipped entirely when motion is reduced.
     --------------------------------------------------------------- */
  function initParallax() {
    if (prefersReduced) return;

    var media = document.querySelector(".hero__media");
    var hero = document.querySelector(".hero");
    if (!media || !hero) return;

    var ticking = false;
    var maxShift = 80;

    function update() {
      var offset = window.scrollY * 0.3;
      if (offset > maxShift) offset = maxShift;
      media.style.transform = "translateY(" + offset + "px)";
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        // Only bother while the hero is roughly in view.
        if (window.scrollY > window.innerHeight) return;
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ---------------------------------------------------------------
     5. Language toggle — stub for phase 2 (EN/ES).
        Reads/writes a preference; real string-swapping lands later.
     --------------------------------------------------------------- */
  function initLangToggle() {
    var toggle = document.querySelector("[data-lang-toggle]");
    if (!toggle) return;

    var stored = null;
    try {
      stored = window.localStorage.getItem("ah-lang");
    } catch (e) {
      /* storage unavailable — ignore */
    }
    var current = stored || document.documentElement.lang || "es";

    function reflect() {
      toggle.setAttribute("data-lang", current);
      toggle.setAttribute(
        "aria-label",
        current === "es" ? "Cambiar idioma a inglés" : "Switch language to Spanish"
      );
    }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      current = current === "es" ? "en" : "es";
      try {
        window.localStorage.setItem("ah-lang", current);
      } catch (err) {
        /* ignore */
      }
      reflect();
      // Phase 2: swap page strings / route to /en/ here.
    });

    reflect();
  }

  /* ---------------------------------------------------------------
     6. Footer year
     --------------------------------------------------------------- */
  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --------------------------------------------------------------- */
  function init() {
    initNav();
    initReveals();
    initHero();
    initParallax();
    initLangToggle();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
