document.addEventListener("DOMContentLoaded", () => {
  const mapObject = document.getElementById("world-map");
  if (!mapObject) return;

  // Map Azgaar state ids to your category slugs
  // Adjust these slugs later to match your real collection names / URLs
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

      el.style.cursor = "pointer";

      el.addEventListener("mouseenter", () => {
        el.setAttribute("stroke", "#ffd37a");
        el.setAttribute("stroke-width", "3");
        el.setAttribute("fill-opacity", "1");
      });

      el.addEventListener("mouseleave", () => {
        if (originalStroke) el.setAttribute("stroke", originalStroke);
        else el.removeAttribute("stroke");

        if (originalStrokeWidth) el.setAttribute("stroke-width", originalStrokeWidth);
        else el.removeAttribute("stroke-width");

        if (originalOpacity) el.setAttribute("fill-opacity", originalOpacity);
        else el.removeAttribute("fill-opacity");
      });

      el.addEventListener("click", () => {
        const category = stateToCategory[stateId];
        if (!category) return;
        // All categories go to collection.html for now
        window.location.href = `collection.html?category=${encodeURIComponent(category)}`;
      });
    });
  });
});
