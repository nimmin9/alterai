(function () {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const deck = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsNav = document.querySelector(".dots");

  if (!deck || slides.length === 0 || !dotsNav) return;

  // Build dots
  slides.forEach((slide, idx) => {
    const a = document.createElement("a");
    a.className = "dot";
    a.href = `#${slide.id}`;
    a.setAttribute("aria-label", `Go to slide ${idx + 1}`);
    a.setAttribute("role", "tab");
    a.dataset.target = slide.id;
    dotsNav.appendChild(a);
  });

  const dots = Array.from(document.querySelectorAll(".dot"));

  function setActiveDot(activeId) {
    dots.forEach((d) =>
      d.setAttribute("aria-current", d.dataset.target === activeId ? "true" : "false")
    );
  }

  // Hash -> scroll (without abrupt jumps)
  function scrollToId(id, behavior) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: behavior || "smooth", block: "start" });
  }

  // If loaded with a hash, scroll into view once layout settles
  if (location.hash) {
    const id = location.hash.replace("#", "");
    window.requestAnimationFrame(() => scrollToId(id, "auto"));
  }

  // Clicking dots: smooth scroll and avoid double-jump
  dotsNav.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLAnchorElement)) return;
    if (!t.classList.contains("dot")) return;

    const id = t.dataset.target;
    if (!id) return;

    e.preventDefault();
    scrollToId(id, "smooth");

    // Update URL without forcing default jump
    history.replaceState(null, "", `#${id}`);
  });

  // Deterministic active slide: nearest snap point
  function getActiveSlide() {
    const deckRect = deck.getBoundingClientRect();
    let best = null;
    let bestDist = Infinity;

    slides.forEach((slide) => {
      const r = slide.getBoundingClientRect();
      const dist = Math.abs(r.top - deckRect.top);
      if (dist < bestDist) {
        bestDist = dist;
        best = slide;
      }
    });

    return best;
  }

  let ticking = false;
  function updateActiveFromScroll() {
    const active = getActiveSlide();
    if (!active) return;
    const id = active.id;

    setActiveDot(id);

    // Keep hash synced while scrolling (replaceState avoids back-button spam)
    if (location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
  }

  deck.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveFromScroll();
      ticking = false;
    });
  });

  // Initial state
  setActiveDot(slides[0].id);
  requestAnimationFrame(updateActiveFromScroll);

  // Re-sync on resize/orientation changes
  window.addEventListener("resize", () => requestAnimationFrame(updateActiveFromScroll));

  // Keyboard navigation
  function go(delta) {
    const current = dots.findIndex((d) => d.getAttribute("aria-current") === "true");
    const next = Math.max(0, Math.min(slides.length - 1, current + delta));
    slides[next].scrollIntoView({ behavior: "smooth", block: "start" });
    slides[next].focus({ preventScroll: true });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") go(1);
    if (e.key === "ArrowUp" || e.key === "PageUp") go(-1);
  });

  // Video play hygiene for mobile browsers
  const videos = Array.from(document.querySelectorAll("video"));

  function safePlay(v) {
    try {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {}
  }

  function safePause(v) {
    try {
      v.pause();
    } catch {}
  }

  // Ensure muted + playsinline (some browsers are strict)
  videos.forEach((v) => {
    v.muted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
  });

  // Lazy play: only videos near viewport play
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) safePlay(v);
        else safePause(v);
      });
    },
    { root: deck, threshold: 0.25 }
  );

  videos.forEach((v) => videoObserver.observe(v));

  // Pause videos when tab hidden; when visible, re-evaluate visible ones
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      videos.forEach(safePause);
      return;
    }

    requestAnimationFrame(() => {
      const deckRect = deck.getBoundingClientRect();
      videos.forEach((v) => {
        const r = v.getBoundingClientRect();
        const isVisible =
          r.bottom > deckRect.top && r.top < deckRect.bottom && r.right > deckRect.left && r.left < deckRect.right;
        if (isVisible) safePlay(v);
      });
    });
  });
})();
