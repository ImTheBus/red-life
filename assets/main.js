// File: assets/main.js  •  Version: v0.7
// Supports labels in:
//  - the embedded SVG document (mapObject.contentDocument)
//  - the main page HTML (overlay labels)
// Labels can be matched by:
//  - data-for="state1" (recommended)
//  - data-state="state1", data-region="state1", data-label-for="state1"
//  - id containing "state1" (eg "label-state1", "state1-label", "state1_label", "foo-state1-bar")

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

  const STATE_IDS = Object.keys(stateToCategory);

  function inferStateIdFromLabelEl(el) {
    if (!el) return null;

    const ds =
      (el.dataset && (el.dataset.for || el.dataset.state || el.dataset.region || el.dataset.labelFor)) || "";
    const id = el.id || "";

    const haystack = `${ds} ${id}`.toLowerCase();
    const match = haystack.match(/state\d{1,2}/);
    if (match && STATE_IDS.includes(match[0])) return match[0];

    return null;
  }

  function collectLabelEls(svgDoc) {
    const all = [];

    // 1) Labels inside the SVG doc
    if (svgDoc) {
      all.push(
        ...svgDoc.querySelectorAll(
          [
            `[data-for]`,
            `[data-state]`,
            `[data-region]`,
            `[data-label-for]`,
            `[id*="state"]`,
          ].join(",")
        )
      );
    }

    // 2) Labels in the main HTML doc (overlay labels)
    all.push(
      ...document.querySelectorAll(
        [
          `[data-for]`,
          `[data-state]`,
          `[data-region]`,
          `[data-label-for]`,
          `[id*="state"]`,
          `.map-label`,
        ].join(",")
      )
    );

    // De-dupe
    return Array.from(new Set(all));
  }

  function makeClickable(el) {
    if (!el) return;
    // Works for both HTML and SVG elements
    el.style.pointerEvents = "auto";
    el.style.cursor = "pointer";
    // Some SVG text/groups can still be weird; force a tiny transparent fill if it's a <text> with no fill.
    try {
      const tag = (el.tagName || "").toLowerCase();
      if (tag === "text") {
        const fill = el.getAttribute && el.getAttribute("fill");
        if (!fill || fill === "none") el.setAttribute("fill", "rgba(255,255,255,0.01)");
      }
    } catch (_) {}
  }

  function attachRegionHandlers(svgDoc) {
    if (!svgDoc) {
      console.warn("[RedLife] SVG document not available.");
      return;
    }

    console.log("[RedLife] main.js running, SVG doc OK");

    const regionEls = new Map(); // stateId -> SVG region element
    STATE_IDS.forEach((stateId) => {
      const region = svgDoc.querySelector(`#${stateId}`);
      if (!region) {
        console.warn(`[RedLife] State element not found: ${stateId}`);
        return;
      }
      regionEls.set(stateId, region);

      // Ensure it has a hoverable hit area
      const fill = region.getAttribute("fill");
      if (!fill || fill === "none") {
        region.setAttribute("fill", "rgba(255,255,255,0.01)");
      }
      region.style.pointerEvents = "all";
      region.style.cursor = "pointer";
      region.style.transition =
        "filter 0.18s ease-out, stroke 0.18s ease-out, stroke-width 0.18s ease-out, opacity 0.18s ease-out";
    });

    const allRegions = Array.from(regionEls.values());

    // Build label map from BOTH documents
    const labelElsByState = new Map(); // stateId -> Set(elements)
    collectLabelEls(svgDoc).forEach((el) => {
      const stateId = inferStateIdFromLabelEl(el);
      if (!stateId) return;
      if (!labelElsByState.has(stateId)) labelElsByState.set(stateId, new Set());
      labelElsByState.get(stateId).add(el);
    });

    console.log(
      "[RedLife] Regions found:",
      regionEls.size,
      "| Label groups found:",
      labelElsByState.size
    );

    const original = new Map(); // element -> snapshot
    function snapshot(el) {
      if (!el || original.has(el)) return;
      original.set(el, {
        stroke: el.getAttribute ? el.getAttribute("stroke") || "" : "",
        strokeWidth: el.getAttribute ? el.getAttribute("stroke-width") || "" : "",
        fillOpacity: el.getAttribute ? el.getAttribute("fill-opacity") || "" : "",
        filter: el.style ? el.style.filter || "" : "",
        transform: el.style ? el.style.transform || "" : "",
        transformOrigin: el.style ? el.style.transformOrigin || "" : "",
        opacity: el.style ? el.style.opacity || "" : "",
      });
    }

    function applyActiveStyle(stateId) {
      const regionEl = regionEls.get(stateId);
      if (!regionEl) return;

      if (hoverLabel) {
        hoverLabel.textContent = stateId.replace("state", "Region ");
        hoverLabel.classList.add("is-visible");
      }

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

    let clearTimer = null;

    function setActive(stateId) {
      if (clearTimer) {
        clearTimeout(clearTimer);
        clearTimer = null;
      }
      applyActiveStyle(stateId);
    }

    function scheduleClearIfLeft(stateId) {
      if (clearTimer) clearTimeout(clearTimer);

      clearTimer = setTimeout(() => {
        const regionEl = regionEls.get(stateId);
        const labels = labelElsByState.get(stateId);

        const regionHovering = regionEl ? regionEl.matches(":hover") : false;

        let labelHovering = false;
        if (labels && labels.size) {
          for (const el of labels) {
            if (el.matches && el.matches(":hover")) {
              labelHovering = true;
              break;
            }
          }
        }

        if (!regionHovering && !labelHovering) restoreAll();
      }, 80);
    }

    // Attach handlers to regions + labels
    STATE_IDS.forEach((stateId) => {
      const regionEl = regionEls.get(stateId);
      if (!regionEl) return;

      snapshot(regionEl);

      regionEl.addEventListener("mouseenter", () => setActive(stateId));
      regionEl.addEventListener("mouseleave", () => scheduleClearIfLeft(stateId));
      regionEl.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateTo(stateId);
      });

      const labels = labelElsByState.get(stateId);
      if (labels && labels.size) {
        for (const labelEl of labels) {
          snapshot(labelEl);
          makeClickable(labelEl);

          labelEl.addEventListener("mouseenter", () => setActive(stateId));
          labelEl.addEventListener("mouseleave", () => scheduleClearIfLeft(stateId));
          labelEl.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigateTo(stateId);
          });
        }
      } else {
        console.warn(`[RedLife] No label elements mapped to ${stateId}.`);
      }
    });

    restoreAll();
  }

  mapObject.addEventListener("load", () => {
    attachRegionHandlers(mapObject.contentDocument || null);
  });

  if (mapObject.contentDocument) {
    attachRegionHandlers(mapObject.contentDocument);
  }
});
