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

  /* ---------------------------------------------------------------
     7. Cookie consent (RGPD) — Google Analytics loads only on accept.
        Choice stored in localStorage under "ah-cookie-consent".
     --------------------------------------------------------------- */
  var GA_ID = "G-XWB760J15B";
  var CONSENT_KEY = "ah-cookie-consent";

  function loadAnalytics() {
    if (window.__ahGaLoaded) return;
    window.__ahGaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  }

  function getConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* ignore */ }
  }
  function clearConsent() {
    try { window.localStorage.removeItem(CONSENT_KEY); } catch (e) { /* ignore */ }
  }

  function hideBanner(banner) {
    banner.classList.remove("is-open");
    window.setTimeout(function () {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    }, 600);
  }

  function showBanner() {
    if (document.querySelector(".cookie-banner")) return;

    var banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML =
      '<p>We use Google Analytics cookies to understand how visitors use this site. ' +
      'You can accept or decline — declining keeps the site fully usable. ' +
      'See our <a href="cookies.html">Cookie Policy</a>.</p>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="btn btn--primary" data-cookie-accept>Accept</button>' +
      '<button type="button" class="btn btn--outline" data-cookie-decline>Decline</button>' +
      '</div>';
    document.body.appendChild(banner);

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        banner.classList.add("is-open");
      });
    });

    banner.querySelector("[data-cookie-accept]").addEventListener("click", function () {
      setConsent("accepted");
      loadAnalytics();
      hideBanner(banner);
    });
    banner.querySelector("[data-cookie-decline]").addEventListener("click", function () {
      setConsent("rejected");
      hideBanner(banner);
    });
  }

  function initCookieConsent() {
    var consent = getConsent();

    if (consent === "accepted") {
      loadAnalytics();
    } else if (consent !== "rejected") {
      showBanner();
    }

    // "Change your cookie choice" controls (e.g. on the Cookie Policy page)
    var resets = document.querySelectorAll("[data-cookie-reset]");
    Array.prototype.forEach.call(resets, function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        clearConsent();
        showBanner();
      });
    });
  }

  /* ---------------------------------------------------------------
     8. Lead forms — submit to the Google Apps Script web app.
        Same pattern as the Graó project: POST JSON as text/plain with
        mode:"no-cors" (no preflight, opaque response → if fetch doesn't
        throw, we treat it as delivered). The Apps Script writes the row
        to your Google Sheet and emails you.
     --------------------------------------------------------------- */
  // Apps Script web-app URL (ends in /exec). One place; serves all forms.
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwO5I7E0I1TuPJHRFdO9p_1HfZjKUTjPG6rhaEJBm8dePqpq3tzvZXoLiMzIhys5_B7/exec";

  function setStatus(el, kind, message) {
    if (!el) return;
    el.textContent = message;
    el.className = "form__status is-" + kind;
  }

  function initLeadForms() {
    var forms = document.querySelectorAll("[data-lead-form]");
    Array.prototype.forEach.call(forms, function (form) {
      var status = form.querySelector("[data-form-status]");
      var button = form.querySelector('button[type="submit"]');

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Honeypot: a filled hidden field means a bot → pretend success, do nothing.
        var hp = form.querySelector('[name="_gotcha"]');
        if (hp && hp.value) {
          setStatus(status, "ok", "Thank you — your message has been sent.");
          form.reset();
          return;
        }

        if (APPS_SCRIPT_URL.indexOf("PEGAR_AQUI") === 0) {
          setStatus(status, "error",
            "Form not connected yet. Please email info@alcalahills.com.");
          return;
        }

        // Collect named fields into a plain object.
        var data = { timestamp: new Date().toISOString(), user_agent: navigator.userAgent };
        Array.prototype.forEach.call(form.elements, function (el) {
          if (el.name && el.type !== "submit") data[el.name] = el.value;
        });

        var originalLabel = button ? button.textContent : "";
        if (button) { button.disabled = true; button.textContent = "Sending…"; }
        setStatus(status, "pending", "");

        fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors", // Apps Script anonymous access → opaque response
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data)
        })
          .then(function () {
            // Opaque response: no body to read. No throw ⇒ delivered.
            setStatus(status, "ok",
              "Thank you — your message has been sent. We'll reply shortly.");
            form.reset();
          })
          .catch(function () {
            setStatus(status, "error",
              "Something went wrong. Please try again, or email info@alcalahills.com.");
          })
          .then(function () {
            if (button) { button.disabled = false; button.textContent = originalLabel; }
          });
      });
    });
  }

  /* --------------------------------------------------------------- */
  function init() {
    initNav();
    initReveals();
    initHero();
    initParallax();
    initLangToggle();
    initYear();
    initCookieConsent();
    initLeadForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
