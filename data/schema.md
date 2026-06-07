# Red Life Adventures content schema

This site is JSON-driven. Each category has a single file in `/data/` containing an array of entries.

- Add new content by adding a new object to the relevant category JSON file.
- Keep `id` unique within that category.
- Prefer short, punchy paragraphs in `body` over long walls of text.

## Category files

- `data/locations.json`
- `data/items.json`
- `data/puzzles.json`
- `data/npc.json`
- `data/story-hooks.json`
- `data/character-hooks.json`
- `data/site-lore.json`
- `data/secrets.json`
- `data/contact.json`
- `data/submit-your-own.json`

## Base entry (works for every category)

Required fields:

- `id` (string)  
  URL-safe slug. Example: `old-stone-bridge`
- `title` (string)
- `summary` (string)  
  One or two sentences.
- `tags` (string[])  
  Lowercase, hyphenated. Example: `["travel-encounter", "haunting"]`
- `region` (string)  
  `state1` to `state10` (or empty string if not regional).  
  **Deprecated as a navigation/filter facet (D-006).** The map now routes by content
  type, not place. `region` persists as a latent value but is NOT a filter-bar facet and
  is not surfaced in the UI. Leave existing values as-is; new entries may omit it.
- `difficulty` (string)  
  `easy` | `medium` | `hard` (or empty string).
- `body` (string[])  
  Paragraphs, in order.

### Facet fields (filter-bar taxonomy — D-004 LOCKED)

These power the in-area filter bar on `collection.html`. They are a **closed, controlled
vocabulary** (the only legal values are listed below) so the data and the filter UI match
byte-for-byte. Values are stored lowercase, hyphenated where multi-word. The renderer
ignores unknown fields, so these are backward-compatible additions. Canonical source of
truth for the full vocab + per-collection filter sets:
`10-projects/redlifeadventures/filter-spec.md`.

- `tier` (string) — party-level band.  
  `1` Low (lv 1–4) | `2` Mid (lv 5–10) | `3` High (lv 11–16) | `4` Epic (lv 17–20).  
  Separate facet from `difficulty` (D-003): tier = is-it-for-my-party's-level; difficulty
  = relative hardness within a tier.
- `biome` (string) — setting / terrain.  
  `forest` | `coast` | `underwater` | `marsh` | `cavern` | `mountain` | `urban` | `ruins`
  | `frontier` | `frozen` | `planar`.
- `mood` (string) — tone.  
  `unsettling` | `wondrous` | `grim` | `comic` | `mysterious` | `heroic` | `melancholy`.
- `time` (string) — time-to-run. **Encounters only** (a place/NPC/item has no run-time).  
  `5-min` | `15-min` | `1-hour` | `full-session`.
- `party` (string, optional) — party-size scaling. **Encounters only.**  
  `solo` | `small` | `standard` | `large`.

Item-native and NPC-native controlled facets (already in the per-category field guides
below): `rarity` and `type` (Items), `role` (NPCs). These are exposed in those collections'
filter bars per `filter-spec.md` §3.

**Which facets appear per collection** is defined in `filter-spec.md` §3 (the per-collection
filter sets). Not every facet suits every type: `time`/`party` are Encounters-only;
`rarity`/`type` are Items-only; `biome` is omitted from NPCs / Character Hooks / Secrets.
Writers should set **all applicable facets** plus 3–6 open `tags` per entry.

Common optional fields (recommended):

- `hooks` (string[])  
  Adventure prompts.
- `complications` (string[])  
  Things that go wrong or add tension.
- `rewards` (string[])  
  What players gain.
- `image` (string)  
  Relative path, e.g. `assets/img/locations/old-stone-bridge.jpg`
- `links` ({label:string,url:string}[])  
  For cross-references or external references.
- `related` (string[])  
  Structured interconnection links — a list of entry **ids** (or, for not-yet-published
  targets, queue **ids**) this entry connects to. Example:
  `["the-water-came-later", "marrows-toll", "old-stone-bridge"]`.
  Replaces dangling prose pointers ("see X", "if you've run X") with machine-checkable
  links. Each value must resolve to either a **published entry id** (EXISTS in some
  `data/*.json`) or a **queued id** (in `content-manifest.json`); a value that resolves to
  neither is a defect the editor pass rejects. The detail page surfaces these as a
  **"Related"** section: ids that resolve to a published entry render as links to that
  entry's detail page; ids that point at a queued-but-unwritten target render as a
  non-link **"coming soon"** chip, never a dead link. Source of truth for the field and
  its surfacing: `10-projects/redlifeadventures/filter-spec.md` §5 and
  `editorial-standard.md` §C.
- `created` (YYYY-MM-DD)
- `updated` (YYYY-MM-DD)

Minimal example:

```json
{
  "id": "mistwatch-tower",
  "title": "Mistwatch Tower",
  "summary": "A ruined watchtower that only appears on foggy mornings.",
  "tags": ["ruins", "watchtower", "fog"],
  "region": "state2",
  "difficulty": "medium",
  "body": [
    "Describe what the party sees first.",
    "Describe what changes if they stay too long."
  ],
  "hooks": ["A courier vanished near the tower."],
  "created": "2025-12-12",
  "updated": "2025-12-12"
}
```

## Field guides by category

These are additional fields you *may* add per category. The renderer will ignore unknown fields for now, but these conventions keep content consistent.

### Locations (`data/locations.json`)

Suggested extra fields:

- `notable_features` (string[])
- `encounters` (string[])
- `secrets` (string[])
- `factions` (string[])
- `connections` (string[])  
  IDs of related entries, e.g. `["npc:river-witch", "item:iron-charm"]`

### NPCs (`data/npc.json`)

Suggested extra fields:

- `role` (string)  
  Example: `ferryman`, `cultist recruiter`, `innkeeper`
- `faction` (string)
- `appearance` (string[])
- `personality` (string[])
- `goals` (string[])
- `secrets` (string[])
- `dialogue` (string[])  
  One-liners or prompts.
- `statblock` (string)  
  A link or a short reference, if you use them.

### Items (`data/items.json`)

Suggested extra fields:

- `rarity` (string)  
  Example: `common`, `uncommon`, `rare`
- `type` (string)  
  Example: `wondrous item`, `weapon`, `consumable`
- `properties` (string[])  
  What it does (mechanics).
- `drawbacks` (string[])  
  Costs, side effects, risks.
- `attunement` (boolean)

### Puzzles (`data/puzzles.json`)

Suggested extra fields:

- `setup` (string[])
- `clues` (string[])
- `solution` (string[])
- `failure_states` (string[])
- `variants` (string[])

### Story hooks (`data/story-hooks.json`) and Character hooks (`data/character-hooks.json`)

Suggested extra fields:

- `stakes` (string[])
- `next_steps` (string[])
- `twists` (string[])

### Site lore (`data/site-lore.json`)

Suggested extra fields:

- `truth` (string[])  
  What is actually true in the setting.
- `rumours` (string[])
- `how_to_reveal` (string[])

### Secrets (`data/secrets.json`)

Suggested extra fields:

- `trigger` (string[])  
  What reveals it.
- `consequences` (string[])
- `who_knows` (string[])

## Naming rules (keep things easy)

- Use lowercase, hyphenated `id` values.
- Keep `tags` lowercase, hyphenated.
- Keep paragraphs short. Prefer `body` as 2 to 6 paragraphs.
- Put state linkage in `region` only. Do not bake it into `title`.

