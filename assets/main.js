document.addEventListener("DOMContentLoaded", () => {
  const mapObject = document.getElementById("world-map");
  if (!mapObject) return;

  // Map state ids from map.svg to category slugs
  const stateToCategory = {
    state1: "locations",
    state2: "items",
    state3: "puzzles",
    state4: "character-hooks",
    state5: "npc",
    state6: "contact",
    state7: "story-hooks",
    state8: "site-lore",
    state9: "submit-your-own",
    state10: "secrets"
  };

  mapObject.addEventListener("load", () => {
    const svg = mapObject.contentDocument;
    if (!svg) {
      console.error("Could not access SVG content (origin issue?)");
      return;
    }

    const stateIds = Object.keys(stateToCategory);

    stateIds.forEach(stateId => {
      const el = svg.getElementById(stateId);
      if (!el) return;

      const originalStroke = el.getAttribute("stroke") || "";
      const originalStrokeWidth = el.getAttribute("stroke-width") || "";
      const originalOpacity = el.getAttribute("fill-opacity") || "";
      const originalFilter = el.style.filter || "";
      const originalTransform = el.style.transform || "";
      const originalTransformOrigin = el.style.transformOrigin || "";

      // Make interaction feel smooth
      el.style.transition = "transform 0.18s ease-out, filter 0.18s ease-out, stroke 0.18s ease-out";
      el.style.cursor = "pointer";

      el.addEventListener("mouseenter", () => {
        el.setAttribute("stroke", "#ffd37a");
        el.setAttribute("stroke-width", "3");
        el.setAttribute("fill-opacity", "1");

        // Glow + gentle scale
        el.style.transformOrigin = "50% 50%";
        el.style.transform = "scale(1.02)";
        el.style.filter = "drop-shadow(0 0 8px rgba(255, 213, 122, 0.9))";
      });

      el.addEventListener("mouseleave", () => {
        if (originalStroke) el.setAttribute("stroke", originalStroke);
        else el.removeAttribute("stroke");

        if (originalStrokeWidth) el.setAttribute("stroke-width", originalStrokeWidth);
        else el.removeAttribute("stroke-width");

        if (originalOpacity) el.setAttribute("fill-opacity", originalOpacity);
        else el.removeAttribute("fill-opacity");

        el.style.filter = originalFilter;
        el.style.transform = originalTransform;
        el.style.transformOrigin = originalTransformOrigin;
      });

      el.addEventListener("click", () => {
        const category = stateToCategory[stateId];
        if (!category) return;
        window.location.href = `collection.html?category=${encodeURIComponent(category)}`;
      });
    });
  });
});
