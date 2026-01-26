(function () {
  // Set footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Copy checkout link
  const buyBtn = document.getElementById("buyButton");
  const copyBtn = document.getElementById("copyLinkBtn");

  function getCheckoutLink() {
    if (!buyBtn) return "";
    return buyBtn.getAttribute("href") || "";
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const link = getCheckoutLink();
      if (!link || link.includes("[STRIPE_CHECKOUT_LINK]")) {
        alert("Add your Stripe Checkout link in index.html first.");
        return;
      }
      try {
        await navigator.clipboard.writeText(link);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy link"), 1200);
      } catch {
        alert("Copy failed. You can manually copy the link from the button.");
      }
    });
  }

  // Keep support window text consistent across sections (optional convenience)
  // Replace only if you set it in one place in the HTML.
  const supportInline = document.getElementById("supportWindowInline");
  const supportPricing = document.getElementById("supportWindow");
  const supportFaq = document.getElementById("supportWindowFaq");

  if (supportInline && supportPricing && supportFaq) {
    const value = supportInline.textContent.trim();
    if (value && !value.includes("[SET SUPPORT WINDOW]")) {
      supportPricing.textContent = value;
      supportFaq.textContent = value;
    }
  }
})();
