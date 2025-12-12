// File: assets/main.js  •  Version: v0.6
// Goal: Hovering either a region (state) OR its label keeps the same region highlighted and clickable.

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

  // Try to find a label element that corresponds to a given stateId.
  // Supports a few common conventions so you do not have to be exact:
  // - id="label-state1" or id="state1-label" or id="state1_label"
  // - data-for="state1" or data-state="state1" or data-region="state1"
  function findLabelForState(doc, stateId) {
    const selectors = [
      `#label-${stateId}`,
      `#${stateId}-label`,
      `#${stateId}_label`,
      `[data-for="${stateId}"]`,
      `[data-state="${stateId}"]`,
      `[data-region="${stateId}"]`,
      `[data-label-for="${stateId}"]`,
    ];

    for (const sel of selectors) {
      const node = doc.querySelector(sel);
      if (node) return node;
    }
    return null;
  }

  function attachRegionHandlers(doc) {
    if (!doc) {
      console.warn("[RedLife] SVG document not available.");
      return;
    }

    console.log("[RedLife] main.js running, SVG doc OK");

    const regionEls = new Map(); // stateId -> region element
    const labelEls = new Map();  // stateId -> label element (optional)

    // Collect regions and matching labels
    Object.keys(stateToCategory).forEach((stateId) => {
      const region = doc.querySelector(`#${stateId}`);
      if (!region) {
        console.warn(`[RedLife] State element not found: ${stateId}`);
        return;
      }

      const label = findLabelForState(doc, stateId);
      if (!label) {
        // Labels are optional, but log so you can confirm naming quickly.
        console.warn(`[RedLife] Label element not found for: ${stateId}`);
      }

      regionEls.set(stateId, region);
      if (label) labelEls.set(stateId, label);
    });

    const allRegions = Array.from(regionEls.values());

    // Per-state original styles so we can restore cleanly
    const original = new Map(); // element -> { ... }

    function snapshot(el) {
      if (original.has(el)) return;
      original.set(el, {
        stroke: el.getAttribute("stroke") || "",
        strokeWidth: el.getAttribute("stroke-width") || "",
        fillOpacity: el.getAttribute("fill-opacity") || "",
        filter: el.style.filter || "",
        transform: el.style.transform || "",
        transformOrigin: el.style.transformOrigin || "",
        opacity: el.style.opacity || "",
        cursor: el.style.cursor || "",
        pointerEvents: el.style.pointerEvents || "",
        transition: el.style.transition || "",
      });
    }

    function makeHitArea(el) {
      // Ensure it has a hoverable hit area
      const fill = el.getAttribute("fill");
      if (!fill || fill === "none") {
        el.setAttribute("fill", "rgba(255,255,255,0.01)");
      }
      el.style.pointerEvents = "all";
      el.style.cursor = "pointer";
      el.style.transition =
        "filter 0.18s ease-out, stroke 0.18s ease-out, stroke-width 0.18s ease-out, opacity 0.18s ease-out";
    }

    function applyActiveStyle(regionEl) {
      // Dim others
      allRegions.forEach((r) => {
        if (r !== regionEl) r.style.opacity = "0.35";
      });

      regionEl.style.opacity = "1";
      regionEl.setAttribute("stroke", "rgba(255,255,255,0.9)");
      regionEl.setAttribute("stroke-width", "3");
      regionEl.style.filter = [
        "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
        "drop-shadow(0 0 10px rgba(180,220,255,0.55))",
      ].join(" ");
      regionEl.style.transform = "none";
      regionEl.style.transformOrigin = "";
    }

    function restoreAll() {
      // Restore region styles
      allRegions.forEach((el) => {
        const o = original.get(el);
        if (!o) return;

        if (o.stroke) el.setAttribute("stroke", o.stroke);
        else el.removeAttribute("stroke");

        if (o.strokeWidth) el.setAttribute("stroke-width", o.strokeWidth);
        else el.removeAttribute("stroke-width");

        if (o.fillOpacity) el.setAttribute("fill-opacity", o.fillOpacity);
        else el.removeAttribute("fill-opacity");

        el.style.filter = o.filter;
        el.style.transform = o.transform;
        el.style.transformOrigin = o.transformOrigin;
        el.style.opacity = o.opacity;
      });

      if (hoverLabel) hoverLabel.classList.remove("is-visible");
    }

    function navigateTo(stateId) {
      const category = stateToCategory[stateId];
      window.location.href = `collection.html?category=${encodeURIComponent(category)}`;
    }

    let activeStateId = null;
    let clearTimer = null;

    function setActive(stateId) {
      if (clearTimer) {
        clearTimeout(clearTimer);
        clearTimer = null;
      }

      activeStateId = stateId;

      const regionEl = regionEls.get(stateId);
      if (!regionEl) return;

      if (hoverLabel) {
        hoverLabel.textContent = stateId.replace("state", "Region ");
        hoverLabel.classList.add("is-visible");
      }

      applyActiveStyle(regionEl);
    }

    // If pointer leaves region/label, we delay clearing slightly.
    // This avoids flicker when moving between the region and its label.
    function scheduleClearIfTrulyLeft(stateId) {
      if (clearTimer) clearTimeout(clearTimer);

      clearTimer = setTimeout(() => {
        const regionEl = regionEls.get(stateId);
        const labelEl = labelEls.get(stateId);

        const regionHovering = regionEl ? regionEl.matches(":hover") : false;
        const labelHovering = labelEl ? labelEl.matches(":hover") : false;

        if (!regionHovering && !labelHovering) {
          activeStateId = null;
          restoreAll();
        }
      }, 80);
    }

    // Setup handlers for each state and its label
    Object.keys(stateToCategory).forEach((stateId) => {
      const regionEl = regionEls.get(stateId);
      if (!regionEl) return;

      snapshot(regionEl);
      makeHitArea(regionEl);

      const labelEl = labelEls.get(stateId);
      if (labelEl) {
        snapshot(labelEl);
        // Labels should be hoverable/clickable too
        labelEl.style.pointerEvents = "all";
        labelEl.style.cursor = "pointer";
      }

      const onEnter = () => setActive(stateId);
      const onLeave = () => scheduleClearIfTrulyLeft(stateId);
      const onClick = (e) => {
        // Stop odd bubbling inside SVG groups from triggering twice
        e.preventDefault();
        e.stopPropagation();
        navigateTo(stateId);
      };

      regionEl.addEventListener("mouseenter", onEnter);
      regionEl.addEventListener("mouseleave", onLeave);
      regionEl.addEventListener("click", onClick);

      if (labelEl) {
        labelEl.addEventListener("mouseenter", onEnter);
        labelEl.addEventListener("mouseleave", onLeave);
        labelEl.addEventListener("click", onClick);
      }
    });

    // Clicking empty space in the SVG clears highlight
    doc.addEventListener("click", (e) => {
      // If click is not on a tracked region or label, clear.
      const target = e.target;
      const isTracked =
        Array.from(regionEls.values()).includes(target) ||
        Array.from(labelEls.values()).includes(target);

      if (!isTracked) {
        activeStateId = null;
        restoreAll();
      }
    });

    // Initial clear (in case styles were left from previous hot reload etc.)
    restoreAll();
  }

  mapObject.addEventListener("load", () => {
    const doc = mapObject.contentDocument || null;
    attachRegionHandlers(doc);
  });

  if (mapObject.contentDocument) {
    attachRegionHandlers(mapObject.contentDocument);
  }
});
