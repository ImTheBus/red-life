// File: assets/main.js  •  Version: v0.5

document.addEventListener("DOMContentLoaded", () => {
  const mapObject = document.getElementById("world-map");
  const hoverLabel = document.getElementById("hover-label");
  if (!mapObject) return;

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
    state10: "secrets",
  };

  function attachRegionHandlers(doc) {
    if (!doc) {
      console.warn("[RedLife] SVG document not available.");
      return;
    }

    // Prove the script is running and the SVG is reachable
    console.log("[RedLife] main.js running, SVG doc OK");

    Object.keys(stateToCategory).forEach((stateId) => {
      const el = doc.querySelector(`#${stateId}`);
      if (!el) {
        console.warn(`[RedLife] State element not found: ${stateId}`);
        return;
      }

      // Ensure it has a hoverable hit area
      const fill = el.getAttribute("fill");
      if (!fill || fill === "none") {
        el.setAttribute("fill", "rgba(255,255,255,0.01)");
      }
      el.style.pointerEvents = "all";
      el.style.cursor = "pointer";
      el.style.transition = "transform 0.18s ease-out, filter 0.18s ease-out, stroke 0.18s ease-out";

      const originalStroke = el.getAttribute("stroke") || "";
      const originalStrokeWidth = el.getAttribute("stroke-width") || "";
      const originalOpacity = el.getAttribute("fill-opacity") || "";
      const originalFilter = el.style.filter || "";
      const originalTransform = el.style.transform || "";
      const originalTransformOrigin = el.style.transformOrigin || "";

      el.addEventListener("mouseenter", () => {
        if (hoverLabel) {
          hoverLabel.textContent = stateId.replace("state", "Region ");
          hoverLabel.classList.add("is-visible");
        }

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

        if (hoverLabel) hoverLabel.classList.remove("is-visible");
      });

      el.addEventListener("click", () => {
        const category = stateToCategory[stateId];
        window.location.href = `collection.html?category=${encodeURIComponent(category)}`;
      });
    });
  }

  // Wait for the SVG to load inside the <object>
  mapObject.addEventListener("load", () => {
    const doc = mapObject.contentDocument || null;
    attachRegionHandlers(doc);
  });

  // If it already loaded before this script ran
  if (mapObject.contentDocument) {
    attachRegionHandlers(mapObject.contentDocument);
  }
});
