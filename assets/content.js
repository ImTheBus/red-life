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
function renderList(container, category, records) {
  container.innerHTML = "";

  if (!records.length) {
    container.appendChild(
      el("div", "empty", "Nothing here yet — this area is still being written. Check back soon.")
    );
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


  function filterRecords(records, q) {
    const query = (q || "").trim().toLowerCase();
    if (!query) return records;

    return records.filter((r) => {
      const hay = [
        r.id,
        r.title,
        r.summary,
        ...(r.tags || []),
        r.region,
        r.difficulty,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
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

  async function initCollectionPage() {
    const rawCat = getParam("category");
    const category = normaliseCategory(rawCat);

    const titleEl = document.getElementById("collection-title");
    const subtitleEl = document.getElementById("collection-subtitle");
    const listEl = document.getElementById("collection-list");
    const searchEl = document.getElementById("collection-search");

    if (titleEl) titleEl.textContent = titleCaseCategory(category);
    if (subtitleEl) subtitleEl.textContent = "Browse the archive, or search to narrow it down.";

    let records = [];
    try {
      records = await loadCategoryData(category);
    } catch (err) {
      console.error(err);
      if (listEl) listEl.textContent = `Could not load data for "${category}".`;
      return;
    }

    const rerender = () => {
      const filtered = filterRecords(records, searchEl ? searchEl.value : "");
      renderList(listEl, category, filtered);
    };

    if (searchEl) {
      searchEl.addEventListener("input", rerender);
    }

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
