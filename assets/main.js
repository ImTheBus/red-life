const NEW_DAYS = 7; // how long something counts as "new"

async function loadContentIndex() {
  const res = await fetch("assets/content-index.json");
  if (!res.ok) {
    console.error("Failed to load content index");
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function isNew(createdAt) {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= NEW_DAYS;
}

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

/* Home page - build collections and latest */

function buildHomePage(content) {
  const byCategory = {};
  content.forEach(item => {
    const cat = item.category || "other";
    if (!byCategory[cat]) {
      byCategory[cat] = [];
    }
    byCategory[cat].push(item);
  });

  Object.values(byCategory).forEach(list => {
    list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  });

  const collectionsGrid = document.querySelector("[data-collections-grid]");
  if (collectionsGrid) {
    collectionsGrid.innerHTML = "";
    Object.entries(byCategory).forEach(([category, items]) => {
      const newest = items[0];
      const card = document.createElement("a");
      card.className = "collection-card";
      card.href = `collection.html?category=${encodeURIComponent(category)}`;
      card.innerHTML = `
        <div class="collection-card-image">
          <img src="${newest.image || "assets/img/ui/locations.jpg"}" alt="${category}">
          ${isNew(newest.createdAt) ? `<div class="badge-new">New entries</div>` : ""}
        </div>
        <div class="collection-card-body">
          <div class="collection-name">${categoryLabel(category)}</div>
          <div class="collection-meta">
            ${items.length} entries • Latest: ${formatDate(newest.createdAt)}
          </div>
        </div>
      `;
      collectionsGrid.appendChild(card);
    });
  }

  const latestGrid = document.querySelector("[data-latest-grid]");
  if (latestGrid) {
    latestGrid.innerHTML = "";
    const sorted = [...content].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    const latest = sorted.slice(0, 6);
    latest.forEach(item => {
      const card = document.createElement("a");
      card.className = "content-card";
      card.href = item.url;
      card.innerHTML = `
        <div class="content-card-thumb">
          <img src="${item.image || "assets/img/ui/locations.jpg"}" alt="${item.title}">
        </div>
        <div class="content-card-body">
          <div class="content-card-title">${item.title}</div>
          <div class="content-card-meta">
            ${categoryLabel(item.category)} • ${formatDate(item.createdAt)}
          </div>
          <div class="content-card-tags">
            ${item.tags ? item.tags.map(t => `<span class="content-tag">${t}</span>`).join("") : ""}
          </div>
        </div>
        ${isNew(item.createdAt) ? `<div class="badge-new">New</div>` : ""}
      `;
      latestGrid.appendChild(card);
    });
  }
}

/* Collection page - filterable list */

function buildCollectionPage(content) {
  const cat = getParam("category") || "location";
  const titleEl = document.querySelector("[data-collection-title]");
  if (titleEl) {
    titleEl.textContent = categoryLabel(cat);
  }

  const introEl = document.querySelector("[data-collection-intro]");
  if (introEl) {
    introEl.textContent = `All ${categoryLabel(cat)} entries currently on Red Life Adventures. Use the filters to jump to the hooks you need.`;
  }

  const items = content.filter(c => (c.category || "other") === cat);

  const searchInput = document.querySelector("[data-filter-search]");
  const badgesContainer = document.querySelector("[data-filter-badges]");
  const listContainer = document.querySelector("[data-collection-list]");

  if (!listContainer) return;

  const allTags = new Set();
  items.forEach(i => {
    (i.tags || []).forEach(t => allTags.add(t));
  });

  let activeTag = null;
  let searchTerm = "";

  if (badgesContainer) {
    badgesContainer.innerHTML = "";
    Array.from(allTags).sort().forEach(tag => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "filter-badge";
      el.textContent = tag;
      el.addEventListener("click", () => {
        if (activeTag === tag) {
          activeTag = null;
        } else {
          activeTag = tag;
        }
        updateBadges();
        renderList();
      });
      badgesContainer.appendChild(el);
    });

    function updateBadges() {
      badgesContainer.querySelectorAll(".filter-badge").forEach(btn => {
        if (btn.textContent === activeTag) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value.toLowerCase().trim();
      renderList();
    });
  }

  function renderList() {
    listContainer.innerHTML = "";
    const filtered = items.filter(item => {
      const matchTag = !activeTag || (item.tags || []).includes(activeTag);
      const matchSearch =
        !searchTerm ||
        (item.title && item.title.toLowerCase().includes(searchTerm)) ||
        (item.summary && item.summary.toLowerCase().includes(searchTerm));
      return matchTag && matchSearch;
    });

    filtered.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    filtered.forEach(item => {
      const card = document.createElement("a");
      card.className = "content-card";
      card.href = item.url;
      card.innerHTML = `
        <div class="content-card-thumb">
          <img src="${item.image || "assets/img/ui/locations.jpg"}" alt="${item.title}">
        </div>
        <div class="content-card-body">
          <div class="content-card-title">${item.title}</div>
          <div class="content-card-meta">
            ${formatDate(item.createdAt)} • ${(item.tags || []).join(", ")}
          </div>
          <div class="content-card-tags">
            ${item.tags ? item.tags.map(t => `<span class="content-tag">${t}</span>`).join("") : ""}
          </div>
        </div>
        ${isNew(item.createdAt) ? `<div class="badge-new">New</div>` : ""}
      `;
      listContainer.appendChild(card);
    });
  }

  renderList();
}

/* Helpers */

function categoryLabel(cat) {
  if (!cat) return "Other";
  switch (cat.toLowerCase()) {
    case "location":
    case "locations":
      return "Locations";
    case "npc":
    case "npcs":
      return "NPCs";
    case "character":
    case "characters":
      return "Characters";
    case "spell":
    case "spells":
      return "Spells";
    case "hook":
    case "hooks":
      return "Story Hooks";
    default:
      return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
}

/* Init */

document.addEventListener("DOMContentLoaded", async () => {
  const pageType = document.body.dataset.page;
  const content = await loadContentIndex();

  if (pageType === "home") {
    buildHomePage(content);
  } else if (pageType === "collection") {
    buildCollectionPage(content);
  }
});
