document.documentElement.classList.add("has-js");

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".mobile-menu-toggle");
const mainNavigation = document.querySelector("#main-navigation");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (header) {
  let headerIsScrolled = header.classList.contains("is-scrolled");

  const updateHeader = () => {
    const nextScrolledState = window.scrollY > 24;
    if (nextScrolledState === headerIsScrolled) return;

    headerIsScrolled = nextScrolledState;
    header.classList.toggle("is-scrolled", nextScrolledState);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

if (header && menuToggle && mainNavigation) {
  const setMenuOpen = (open) => {
    header.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  mainNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (menuToggle.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && menuToggle.getAttribute("aria-expanded") === "true") setMenuOpen(false);
  }, { passive: true });
}

if (!prefersReducedMotion.matches && window.Motion) {
  document.documentElement.classList.add("motion-enabled");

  const { animate, hover, inView, press } = window.Motion;
  const ease = [0.16, 1, 0.3, 1];
  const revealed = new WeakSet();
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const reveal = (target, options = {}) => {
    const elements = typeof target === "string" ? document.querySelectorAll(target) : target;
    const { distance = 24, duration = 0.7, delay = 0, amount = 0.26, clip = false, scale = 1 } = options;

    inView(elements, (element) => {
      if (revealed.has(element)) return;
      revealed.add(element);

      const keyframes = { opacity: [0, 1], y: [distance, 0] };
      if (scale !== 1) keyframes.scale = [scale, 1];
      if (clip) keyframes.clipPath = ["inset(0 0 7% 0)", "inset(0)"];

      animate(element, keyframes, { duration, delay, ease });
    }, { amount });
  };

  const revealDecoration = (selector, amount = 0.38) => {
    const element = document.querySelector(selector);
    if (!element) return;

    inView(element, (target) => {
      if (revealed.has(target)) return;
      revealed.add(target);
      target.classList.add("is-revealed");
    }, { amount });
  };

  const heroGrain = document.querySelector(".hero-grain");
  if (heroGrain) {
    animate(heroGrain, { opacity: [0, 0.22], x: [-8, 0] }, { duration: 0.74, delay: 0.04, ease });
  }

  const headerLogo = document.querySelector(".header-logo");
  if (headerLogo) {
    animate(headerLogo, { opacity: [0, 1], y: [-6, 0] }, { duration: 0.46, delay: 0.04, ease });
  }

  const heroSequence = [
    [".hero h1", 0.14, 0.88],
    [".hero-lead", 0.34, 0.68],
    [".hero-actions", 0.52, 0.58]
  ];

  heroSequence.forEach(([selector, delay, duration]) => {
    const element = document.querySelector(selector);
    if (element) {
      animate(
        element,
        { opacity: [0, 1], y: [24, 0], clipPath: ["inset(0 0 9% 0)", "inset(0)"] },
        { duration, delay, ease }
      );
    }
  });

  const heroMedia = document.querySelector(".hero-media");
  if (heroMedia) {
    animate(
      heroMedia,
      { opacity: [0, 1], y: [28, 0], scale: [0.992, 1], clipPath: ["inset(0 0 8% 0)", "inset(0)"] },
      { duration: 0.92, delay: 0.62, ease }
    );
    window.setTimeout(() => heroMedia.classList.add("is-framed"), 640);
  }

  reveal(".welcome .section-intro", { distance: 22, duration: 0.68 });
  reveal(".welcome-copy", { distance: 18, duration: 0.62, delay: 0.08 });
  reveal(".transition-wheel", { distance: 8, duration: 0.5, delay: 0.12, amount: 0.5 });

  reveal(".flavours-heading h2", { distance: 22, duration: 0.7 });
  reveal(".flavours-heading > p:last-child", { distance: 16, duration: 0.58, delay: 0.08 });
  revealDecoration(".flavours-heading");
  reveal(".buffet-frame", { distance: 22, duration: 0.82, clip: true, scale: 0.978 });
  reveal(".service-story-main", { distance: 18, duration: 0.62, delay: 0.1 });

  reveal(".pizza-feature .service-story-accent", { distance: 22, duration: 0.68 });
  reveal(".pizza-frame", { distance: 24, duration: 0.84, delay: 0.1, clip: true, scale: 0.978 });
  reveal(".pizza-detail", { distance: 16, duration: 0.62, delay: 0.22, scale: 0.985 });
  reveal(".rooster-signature", { distance: 10, duration: 0.5, delay: 0.08, amount: 0.45 });
  revealDecoration(".pizza-feature", 0.3);

  reveal(".experience-quote", { distance: 22, duration: 0.7 });
  reveal(".room-frame", { distance: 22, duration: 0.82, clip: true, scale: 0.978 });
  reveal(".brand-frame", { distance: 16, duration: 0.66, delay: 0.14, scale: 0.985 });

  reveal(".social-proof .rating-number", { distance: 18, duration: 0.62, amount: 0.35 });
  reveal(".social-proof h2, .social-proof .price-note", { distance: 14, duration: 0.56, delay: 0.06, amount: 0.35 });
  reveal(".information-heading", { distance: 20, duration: 0.68 });
  reveal(".hours", { distance: 16, duration: 0.62, delay: 0.08 });
  reveal(".contact-strip", { distance: 12, duration: 0.54, amount: 0.32 });
  reveal(".brand-signature", { distance: 8, duration: 0.62, amount: 0.45, scale: 0.96 });
  reveal(".final-cta h2", { distance: 16, duration: 0.68, delay: 0.12, amount: 0.45 });
  reveal(".final-cta .button", { distance: 12, duration: 0.54, delay: 0.22, amount: 0.45 });

  const controls = document.querySelectorAll(".button, .header-cta");
  controls.forEach((control) => {
    if (finePointer) {
      hover(control, () => {
        const enter = animate(control, { y: -2, scale: 1.01 }, { duration: 0.18, ease });
        return () => {
          enter.stop();
          animate(control, { y: 0, scale: 1 }, { duration: 0.18, ease });
        };
      });
    }

    press(control, () => {
      const down = animate(control, { scale: 0.985 }, { duration: 0.1, ease: "easeOut" });
      return () => {
        down.stop();
        animate(control, { scale: 1 }, { duration: 0.14, ease });
      };
    });
  });

  if (finePointer) {
    document.querySelectorAll(".hero-media, .food-frame, .room-frame, .brand-frame").forEach((frame) => {
      const image = frame.querySelector("img");
      if (!image) return;

      hover(frame, () => {
        const enter = animate(image, { scale: 1.018 }, { duration: 0.42, ease });
        return () => {
          enter.stop();
          animate(image, { scale: 1 }, { duration: 0.46, ease });
        };
      });
    });
  }
}