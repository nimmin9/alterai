// scripts.js
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

  // Observe which slide is active
  const io = new IntersectionObserver(
    (entries) => {
      const best = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!best) return;

      const id = best.target.id;
      setActiveDot(id);

      // Keep hash synced while scrolling (replaceState avoids back-button spam)
      if (location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
    },
    { root: deck, threshold: [0.55, 0.7, 0.85] }
  );

  slides.forEach((s) => io.observe(s));
  setActiveDot(slides[0].id);

  // Keyboard navigation
  function go(delta) {
    const current = dots.findIndex((d) => d.getAttribute("aria-current") === "true");
    const next = Math.max(0, Math.min(slides.length - 1, current + delta));
    slides[next].scrollIntoView({ behavior: "smooth", block: "start" });
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
    try { v.pause(); } catch {}
  }

  // Ensure muted + playsinline (some browsers are strict)
  videos.forEach((v) => {
    v.muted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
  });

  // Pause videos when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) videos.forEach(safePause);
    else videos.forEach(safePlay);
  });
})();
