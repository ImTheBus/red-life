// File: assets/main.js  •  Date: 2025-12-02  •  Version: v0.4

document.addEventListener("DOMContentLoaded", () => {
  const mapObject = document.getElementById("world-map");
  if (!mapObject) return;

  // Map state ids from map.svg to category slugs
  // Adjust slugs later to match your real collection URLs
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

  function getMapDocument() {
    // Some browsers implement getSVGDocument, others expose contentDocument
    if (typeof mapObject.getSVGDocument === "function") {
      const doc = mapObject.getSVGDocument();
      if (doc) return doc;
    }
    return mapObject.contentDocument || null;
  }

  function attachRegionHandlers(svg) {
    if (!svg) {
      console.warn("[RedLife] SVG document not available; hover will not work.");
      return;
    }

    const stateIds = Object.keys(stateToCategory);

    stateIds.forEach(stateId => {
      const el = svg.getElementById(stateId);
      if (!el) {
        console.warn(`[RedLife] State element not found: ${stateId}`);
        return;
      }

      const originalStroke = el.getAttribute("stroke") || "";
      const originalStrokeWidth = el.getAttribute("stroke-width") || "";
      const originalOpacity = el.getAttribute("fill-opacity") || "";
      const originalFilter = el.style.filter || "";
      const originalTransform = el.style.transform || "";
      const originalTransformOrigin = el.style.transformOrigin || "";

      // Smooth interaction
      el.style.transition =
        "transform 0.18s ease-out, filter 0.18s ease-out, stroke 0.18s ease-out";
      el.style.cursor = "pointer";

      el.addEventListener("mouseenter", () => {
        el.setAttribute("stroke", "#ffd37a");
        el.setAttribute("stroke-width", "4");
        el.setAttribute("fill-opacity", "1");

        el.style.transformOrigin = "50% 50%";
        el.style.transform = "scale(1.04)";
        el.style.filter = "drop-shadow(0 0 10px rgba(255, 213, 122, 0.9))";
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
  }

  // Try immediately (in case the object has already loaded)
  let svgDoc = getMapDocument();
  if (svgDoc) {
    attachRegionHandlers(svgDoc);
  } else {
    // Otherwise wait for the load event
    mapObject.addEventListener("load", () => {
      svgDoc = getMapDocument();
      attachRegionHandlers(svgDoc);
    });
  }
});
