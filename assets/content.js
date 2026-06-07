// File: assets/content.js  •  Version: v0.1
// Data-driven collections + detail pages for GitHub Pages (static hosting)

(() => {
  const CATEGORY_ALIASES = {
    "location": "locations",
    "locations": "locations",
    "item": "items",
    "items": "items",
    "puzzle": "puzzles",
    "puzzles": "puzzles",
    "npc": "npc",
    "npcs": "npc",
    "character-hooks": "character-hooks",
    "story-hooks": "story-hooks",
    "site-lore": "site-lore",
    "secrets": "secrets",
    "contact": "contact",
    "submit-your-own": "submit-your-own",
    "encounter": "encounters",
    "encounters": "encounters",
    "story-hooks": "story-hooks",
    "table": "tables",
    "tables": "tables",
  };

  // Friendly display titles where the slug alone reads oddly.
  const CATEGORY_TITLES = {
    npc: "NPCs",
    items: "Treasure",
    puzzles: "Traps & Puzzles",
    encounters: "Encounters",
    "story-hooks": "Story Hooks",
    "character-hooks": "Character Hooks",
    locations: "Locations",
    "site-lore": "Lore",
    secrets: "Secrets",
    tables: "Random Tables",
    "submit-your-own": "Submit Your Own",
  };

  // ── Filter taxonomy (filter-spec.md §1 controlled vocab + §3 per-collection sets) ──
  // Controlled vocabulary per facet: value → display label. `tags` is the one OPEN facet
  // (options are derived from the data at render time), so it carries no fixed vocab here.
  const FACET_VOCAB = {
    tier: [
      ["1", "Low (lv 1–4)"],
      ["2", "Mid (lv 5–10)"],
      ["3", "High (lv 11–16)"],
      ["4", "Epic (lv 17–20)"],
    ],
    difficulty: [
      ["easy", "Easy"],
      ["medium", "Medium"],
      ["hard", "Hard"],
    ],
    biome: [
      ["forest", "Forest"], ["coast", "Coast"], ["underwater", "Underwater"],
      ["marsh", "Marsh"], ["cavern", "Cavern"], ["mountain", "Mountain"],
      ["urban", "Urban"], ["ruins", "Ruins"], ["frontier", "Frontier"],
      ["frozen", "Frozen"], ["planar", "Planar"],
    ],
    mood: [
      ["unsettling", "Unsettling"], ["wondrous", "Wondrous"], ["grim", "Grim"],
      ["comic", "Comic"], ["mysterious", "Mysterious"], ["heroic", "Heroic"],
      ["melancholy", "Melancholy"],
    ],
    time: [
      ["5-min", "5 min"], ["15-min", "15 min"],
      ["1-hour", "1 hour"], ["full-session", "Full session"],
    ],
    party: [
      ["solo", "Solo"], ["small", "Small (2–3)"],
      ["standard", "Standard (4–5)"], ["large", "Large (6+)"],
    ],
    rarity: [
      ["common", "Common"], ["uncommon", "Uncommon"], ["rare", "Rare"],
      ["very-rare", "Very rare"], ["legendary", "Legendary"],
    ],
    type: [
      ["wondrous-item", "Wondrous item"], ["weapon", "Weapon"], ["armor", "Armor"],
      ["consumable", "Consumable"], ["hoard", "Hoard"], ["trinket", "Trinket"],
    ],
    role: [
      ["ally", "Ally"], ["rival", "Rival"], ["merchant", "Merchant"],
      ["authority", "Authority"], ["villain", "Villain"], ["guide", "Guide"],
      ["informant", "Informant"],
    ],
  };

  // Human label for each facet's filter-bar heading.
  const FACET_LABELS = {
    tier: "Tier", difficulty: "Difficulty", biome: "Biome", mood: "Mood",
    time: "Time to run", party: "Party size", rarity: "Rarity", type: "Type",
    role: "Role", tags: "Tags",
  };

  // Per-collection filter sets (filter-spec.md §3), in display order (most-decisive-first).
  // `tags` is always the trailing open facet. A collection not listed gets a sensible default.
  const COLLECTION_FACETS = {
    npc:               ["tier", "difficulty", "role", "mood", "tags"],
    items:             ["tier", "rarity", "type", "biome", "tags"],
    puzzles:           ["tier", "difficulty", "biome", "mood", "tags"],
    encounters:        ["tier", "difficulty", "time", "biome", "party", "mood", "tags"],
    "story-hooks":     ["tier", "biome", "mood", "tags"],
    "character-hooks": ["tier", "mood", "tags"],
    locations:         ["tier", "difficulty", "biome", "mood", "tags"],
    "site-lore":       ["biome", "mood", "tags"],
    secrets:           ["tier", "mood", "tags"],
    tables:            ["biome", "tags"],
  };

  // Collections that are content gateways but have no filter bar (intake forms etc.).
  const NO_FILTER_BAR = new Set(["submit-your-own", "contact"]);

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function normaliseCategory(raw) {
    const key = (raw || "").trim().toLowerCase();
    return CATEGORY_ALIASES[key] || key || "locations";
  }

  function titleCaseCategory(cat) {
    if (cat && CATEGORY_TITLES[cat]) return CATEGORY_TITLES[cat];
    return (cat || "collection")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  async function loadCategoryData(category) {
    const url = `data/${encodeURIComponent(category)}.json`;
    let res;
    try {
      res = await fetch(url, { cache: "no-store" });
    } catch (_) {
      // network/parse failure — degrade to a graceful empty area, don't crash
      return [];
    }
    // A category whose JSON doesn't exist yet (e.g. encounters, tables) is a valid
    // empty gateway, not an error — render the empty state rather than failing.
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
    const data = await res.json().catch(() => null);
    if (!Array.isArray(data)) return [];
    return data;
  }

  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (typeof text === "string") n.textContent = text;
    return n;
  }

  function renderTags(tags) {
    const wrap = el("div", "tags");
    (tags || []).forEach((t) => {
      const chip = el("span", "tag", t);
      wrap.appendChild(chip);
    });
    return wrap;
  }
function renderList(container, category, records, opts) {
  container.innerHTML = "";
  opts = opts || {};

  if (!records.length) {
    // Distinguish "this area has no content yet" from "your filters excluded everything".
    const msg = opts.filtered
      ? "No matches. Try clearing a filter or widening your search."
      : "Nothing here yet — this area is still being written. Check back soon.";
    container.appendChild(el("div", "empty", msg));
    return;
  }

  records.forEach((r) => {
    const card = el("a", "notice");
    card.href = `detail.html?category=${encodeURIComponent(category)}&id=${encodeURIComponent(r.id)}`;

    // pins
    const pin2 = el("div", "pin2");
    card.appendChild(pin2);

    // content
    const h = el("div", "notice-title", r.title || r.id);
    card.appendChild(h);

    if (r.summary) {
      const s = el("div", "notice-summary", r.summary);
      card.appendChild(s);
    }

    // meta line (optional). Region (stateN) is retired as a display facet (D-006) —
    // don't surface raw state ids; show difficulty + tier where present.
    const metaBits = [];
    if (r.tier) metaBits.push(`TIER ${String(r.tier).toUpperCase()}`);
    if (r.difficulty) metaBits.push(String(r.difficulty).toUpperCase());
    if (metaBits.length) {
      card.appendChild(el("div", "notice-meta", metaBits.join(" • ")));
    }

    if (r.tags && r.tags.length) card.appendChild(renderTags(r.tags));

    container.appendChild(card);
  });
}


  // Free-text search across the entry's text blob (unchanged behaviour, retained).
  function matchesSearch(r, query) {
    if (!query) return true;
    const hay = [
      r.id, r.title, r.summary,
      ...(r.tags || []),
      r.region, r.difficulty, r.tier, r.biome, r.mood,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(query);
  }

  // The value(s) a record carries for a facet, as an array of lowercase strings.
  function recordFacetValues(r, facet) {
    if (facet === "tags") return (r.tags || []).map((t) => String(t).toLowerCase());
    const v = r[facet];
    if (v === undefined || v === null || v === "") return [];
    return [String(v).toLowerCase()];
  }

  // Compose free-text search (AND) with facet filters: AND across different facets,
  // OR within a single facet's selected values. `active` is { facet: Set<value> }.
  function applyFilters(records, query, active) {
    const q = (query || "").trim().toLowerCase();
    return records.filter((r) => {
      if (!matchesSearch(r, q)) return false;
      for (const facet of Object.keys(active)) {
        const wanted = active[facet];
        if (!wanted || wanted.size === 0) continue;
        const have = recordFacetValues(r, facet);
        // OR within facet: the record must carry at least one of the selected values.
        if (!have.some((v) => wanted.has(v))) return false;
      }
      return true;
    });
  }

  // Which option values actually appear in the current data for a facet (avoid dead options).
  function valuesPresentInData(records, facet) {
    const present = new Set();
    records.forEach((r) => recordFacetValues(r, facet).forEach((v) => present.add(v)));
    return present;
  }

  // Build the ordered option list for a facet: controlled vocab in canonical order,
  // narrowed to values present in the data where the facet is controlled. For the open
  // `tags` facet, options are the sorted distinct tags found in the data.
  function facetOptions(facet, records) {
    const present = valuesPresentInData(records, facet);
    if (facet === "tags") {
      return [...present].sort().map((v) => [v, v]);
    }
    const vocab = FACET_VOCAB[facet] || [];
    const inData = vocab.filter(([value]) => present.has(value));
    // If the controlled vocab and data disagree entirely (e.g. unexpected values), fall
    // back to showing whatever the data actually has so the bar is never silently empty.
    if (inData.length) return inData;
    return [...present].sort().map((v) => [v, v]);
  }

  function renderDetail(container, category, record) {
    container.innerHTML = "";

    const title = el("h1", "detail-title", record.title || record.id);
    container.appendChild(title);

    if (record.summary) {
      container.appendChild(el("p", "detail-summary", record.summary));
    }

    if (record.tags && record.tags.length) container.appendChild(renderTags(record.tags));

    const meta = [];
    if (record.tier) meta.push(`Tier: ${record.tier}`);
    if (record.difficulty) meta.push(`Difficulty: ${record.difficulty}`);
    if (record.updated) meta.push(`Updated: ${record.updated}`);
    if (meta.length) container.appendChild(el("div", "detail-meta", meta.join(" • ")));

    (record.body || []).forEach((p) => {
      container.appendChild(el("p", "detail-p", p));
    });

    function addList(label, items) {
      if (!items || !items.length) return;
      container.appendChild(el("h2", "detail-h2", label));
      const ul = el("ul", "detail-list");
      items.forEach((it) => ul.appendChild(el("li", "", it)));
      container.appendChild(ul);
    }

    addList("Hooks", record.hooks);
    addList("Complications", record.complications);
    addList("Rewards", record.rewards);

    const back = el("a", "detail-back", `Back to ${titleCaseCategory(category)}`);
    back.href = `collection.html?category=${encodeURIComponent(category)}`;
    container.appendChild(back);
  }

  // The facets to show for a collection, in display order. Unknown categories fall back to
  // a lean, broadly-applicable default so a brand-new gateway still renders a usable bar.
  function facetsForCollection(category) {
    return COLLECTION_FACETS[category] || ["tier", "biome", "mood", "tags"];
  }

  // ── URL state <-> active filters ────────────────────────────────────────────
  // Each facet is a query param holding a comma-separated list of selected values.
  // `?category=` is preserved untouched. Free text lives in `?q=`.
  function readStateFromUrl(facets) {
    const params = new URLSearchParams(window.location.search);
    const active = {};
    facets.forEach((f) => {
      const raw = params.get(f);
      active[f] = new Set(
        raw ? raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) : []
      );
    });
    const q = params.get("q") || "";
    return { active, q };
  }

  function writeStateToUrl(facets, active, q) {
    const params = new URLSearchParams(window.location.search);
    facets.forEach((f) => {
      const vals = [...(active[f] || [])];
      if (vals.length) params.set(f, vals.join(","));
      else params.delete(f);
    });
    if (q && q.trim()) params.set("q", q.trim());
    else params.delete("q");
    const qs = params.toString();
    const url = window.location.pathname + (qs ? `?${qs}` : "");
    window.history.replaceState(null, "", url);
  }

  function buildFilterBar(barEl, facets, records, active, onChange) {
    barEl.innerHTML = "";
    barEl.hidden = false;

    let anyOptionsRendered = false;

    facets.forEach((facet) => {
      const options = facetOptions(facet, records);
      // Skip a facet with no options present in the data (avoid dead controls) — but only
      // if nothing is currently selected for it (a URL-selected value must stay visible
      // so the user can clear it).
      if (!options.length && (!active[facet] || active[facet].size === 0)) return;

      anyOptionsRendered = true;

      const group = el("div", "rla-facet");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", FACET_LABELS[facet] || facet);

      const heading = el("div", "rla-facet-label", (FACET_LABELS[facet] || facet));
      group.appendChild(heading);

      const chips = el("div", "rla-facet-chips");
      const optionSet = new Map(options);
      // Ensure any active-but-not-in-data value still renders (so it can be deselected).
      (active[facet] ? [...active[facet]] : []).forEach((v) => {
        if (!optionSet.has(v)) optionSet.set(v, v);
      });

      [...optionSet.entries()].forEach(([value, label]) => {
        const selected = active[facet] && active[facet].has(value);
        const chip = el("button", "rla-chip", label);
        chip.type = "button";
        chip.setAttribute("aria-pressed", selected ? "true" : "false");
        chip.dataset.facet = facet;
        chip.dataset.value = value;
        if (selected) chip.classList.add("is-active");
        chip.addEventListener("click", () => {
          const set = active[facet] || (active[facet] = new Set());
          if (set.has(value)) set.delete(value);
          else set.add(value);
          onChange();
        });
        chips.appendChild(chip);
      });

      group.appendChild(chips);
      barEl.appendChild(group);
    });

    // "Clear all" — only meaningful if anything is active.
    const anyActive = facets.some((f) => active[f] && active[f].size > 0);
    if (anyActive) {
      const clear = el("button", "rla-clear", "Clear filters");
      clear.type = "button";
      clear.addEventListener("click", () => {
        facets.forEach((f) => active[f] && active[f].clear());
        onChange();
      });
      barEl.appendChild(clear);
    }

    if (!anyOptionsRendered) {
      // No structured facet data yet (e.g. an empty collection): keep the bar present but
      // quiet rather than rendering an empty box.
      barEl.appendChild(
        el("div", "rla-facet-empty", "Filters appear here once this area has content.")
      );
    }
  }

  async function initCollectionPage() {
    const rawCat = getParam("category");
    const category = normaliseCategory(rawCat);

    const titleEl = document.getElementById("collection-title");
    const subtitleEl = document.getElementById("collection-subtitle");
    const listEl = document.getElementById("collection-list");
    const searchEl = document.getElementById("collection-search");
    const barEl = document.getElementById("collection-filters");

    if (titleEl) titleEl.textContent = titleCaseCategory(category);
    if (subtitleEl) subtitleEl.textContent = "Browse the archive, or filter and search to narrow it down.";

    let records = [];
    try {
      records = await loadCategoryData(category);
    } catch (err) {
      console.error(err);
      if (listEl) listEl.textContent = `Could not load data for "${category}".`;
      return;
    }

    const showBar = barEl && !NO_FILTER_BAR.has(category);
    const facets = facetsForCollection(category);
    const { active, q } = readStateFromUrl(facets);

    // Seed the search box from the URL so a shared link restores the full view.
    if (searchEl && q) searchEl.value = q;

    const rerender = () => {
      const query = searchEl ? searchEl.value : q;
      writeStateToUrl(facets, active, query);
      if (showBar) buildFilterBar(barEl, facets, records, active, rerender);
      const filtered = applyFilters(records, query, active);
      const isNarrowing =
        (query && query.trim().length > 0) ||
        facets.some((f) => active[f] && active[f].size > 0);
      // Only call it "filtered to nothing" when the source data isn't itself empty.
      renderList(listEl, category, filtered, { filtered: isNarrowing && records.length > 0 });
    };

    if (searchEl) searchEl.addEventListener("input", rerender);

    if (barEl && !showBar) barEl.hidden = true;

    rerender();
  }

  async function initDetailPage() {
    const rawCat = getParam("category");
    const category = normaliseCategory(rawCat);
    const id = (getParam("id") || "").trim();

    const titleEl = document.getElementById("detail-category");
    const container = document.getElementById("detail-content");

    if (titleEl) titleEl.textContent = titleCaseCategory(category);

    if (!id) {
      if (container) container.textContent = "Missing id.";
      return;
    }

    let records = [];
    try {
      records = await loadCategoryData(category);
    } catch (err) {
      console.error(err);
      if (container) container.textContent = `Could not load data for "${category}".`;
      return;
    }

    const record = records.find((r) => String(r.id) === id);
    if (!record) {
      if (container) container.textContent = `Not found: ${id}`;
      return;
    }

    renderDetail(container, category, record);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body && document.body.dataset && document.body.dataset.page === "collection") {
      initCollectionPage();
    }
    if (document.body && document.body.dataset && document.body.dataset.page === "detail") {
      initDetailPage();
    }
  });
})();
