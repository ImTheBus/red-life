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
- `difficulty` (string)  
  `easy` | `medium` | `hard` (or empty string).
- `body` (string[])  
  Paragraphs, in order.

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

