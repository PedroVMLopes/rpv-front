# `@rpv/content` — Agent Context

Content **sources, catalog, and system-specific curation**. Read the root
`AGENTS.md` first for the project philosophy. This file covers the rules
specific to this package.

## Role

This is where authored/curated content lives and where **system-specific data
is allowed** (the engine in `@rpv/domain` must stay system-agnostic). Content is
expressed as **declarative data** that the engine interprets — never as
per-item/per-class code branches. The platform's goal is community-created
content, so anything an author could plausibly create must be representable as
data here.

## What lives here

- `open5e/` — client + types for the Open5e data source (the D&D source feed).
- `spell/`, `race/` — types + mappers that turn raw source data into catalog
  entries (`*.mapper.ts`, `*.types.ts`).
- `catalog/` — the assembled `Catalog` (races, spells, skills, languages) and
  locale overlays. The base catalog is authored in `defaultLocale`; locale
  overlays are partial, so any missing slug/field falls back to the base text.
  Never assume a translation exists. Built via `scripts/buildCatalog.ts`
  (`npm run build:catalog`).
- `grant/` — the **`Grant`** model: the declarative description of what a piece
  of content gives a character.
  - `grantType`: `ability_score | stat_modifier | ability | skill_proficiency |
    weapon_proficiency | tool_proficiency | armor_proficiency |
    saving_throw_proficiency | language | spell | resource`
  - `choose === 0` → fixed (everything applies); `choose > 0` → the player picks
    `choose` entries from `options` or from a `selectionFilter` pool.
  - `grants.ts` is the **bridge**: it converts `Grant`s into domain `Modifier`s
    and `CharacterGrant`s. This is how authored content feeds the engine. Keep
    this translation generic — driven by the grant data, not by hardcoded names.
- `grant/levelFeature.types.ts` — `LevelFeature { level, grants }` for per-level
  progression. `resolveLevelFeatures()` accumulates blocks where
  `characterLevel >= level`.
- `curation/*.dnd.ts` — **hand-curated, D&D-specific** content (class, race,
  background, item, subclass grants). The `.dnd.ts` suffix marks data as belonging to the
  D&D system.

## Class & subclass authoring

### `ClassEntry` ([`classGrants.dnd.ts`](src/curation/classGrants.dnd.ts))

- `grants` — base proficiencies and fixed features (always apply).
- `featuresByLevel?` — level-gated grants (resources, abilities, spell picks).
- `subclassLevel?` — minimum character level for subclass to apply / be required
  (pilot default: **3**).

Helpers: `getClassGrants(slug, level)`, `getClassGrantSourcesForLevel`,
`getClassSubclassLevel`.

### `SubclassEntry` ([`subclassGrants.dnd.ts`](src/curation/subclassGrants.dnd.ts))

- Namespaced slugs: `fighter-champion`, `wizard-evocation`.
- `classSlug` must match the parent class.
- `grants` (base) + optional `featuresByLevel` (e.g. L3 feature).

### Resource grants (deltas)

Author **increments** per level; aggregation sums by `ref`:

```ts
featuresByLevel: [
  { level: 1, grants: [
      { grantType: "resource", choose: 0, ref: "rage-uses", amount: 2 },
  ]},
  { level: 3, grants: [
      { grantType: "resource", choose: 0, ref: "rage-uses", amount: 1 },
  ]},
]
```

Convention: kebab-case refs (`spell-slots-1`, `rage-uses`, `ki-points`).

### Minimal example — class + subclass

```ts
// classGrants.dnd.ts
{
  slug: "fighter",
  subclassLevel: 3,
  grants: [ /* saves, armor, 2 skill picks */ ],
  featuresByLevel: [
    { level: 2, grants: [{ grantType: "ability", choose: 0, description: "Action Surge" }] },
    { level: 3, grants: [{ grantType: "skill_proficiency", choose: 1, description: "Additional skill", options: [...] }] },
  ],
}

// subclassGrants.dnd.ts
{
  slug: "fighter-champion",
  classSlug: "fighter",
  featuresByLevel: [
    { level: 3, grants: [{ grantType: "ability", choose: 0, description: "Improved Critical" }] },
  ],
}
```

Add pt-BR names in [`data/translations/pt-BR.json`](data/translations/pt-BR.json).

## Item authoring

Item **definitions** (`grants`, `allowedSlots`) live in content curation files.
Whether a character **owns** or **wears** an item is runtime state in
`selections.inventory` (bag / equipped) on the web app — see
[`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) (Inventory contract). Only
**equipped** slugs feed `collectGrantSources`; bag-only items do not alter
stats until equipped.

Pilot catalog (6 items): `scroll-of-fire-bolt`, `amulet-of-vitality`,
`ring-of-hardiness`, `longsword`, `leather-armor`, `shield` in
[`itemGrants.dnd.ts`](src/curation/itemGrants.dnd.ts).

### `ItemEntry` contract

```ts
interface ItemEntry {
  slug: string;            // kebab-case, unique within the system
  system: "dnd";           // namespace; future systems → *.pf2e.ts, etc.
  name: string;            // default locale (en)
  description: string;
  grants: Grant[];         // pilot: choose === 0 only
  allowedSlots?: string[]; // IDs from equipmentSlots.dnd.ts
  stackable?: boolean;     // default true; false for unique gear
}
```

- `grants` — declarative bonuses/abilities applied when the item is **equipped**
  (bag-only items do not grant until equipped).
- `allowedSlots` — slot IDs this item can occupy (validated via
  [`equipmentSlots.dnd.ts`](src/curation/equipmentSlots.dnd.ts) and `canEquipItem`).
- `stackable` — defaults to **true** when omitted; set `false` for unique gear
  (rings, weapons, armor).

Helpers: `getItem(slug, system?, locale?)`, `listItems(system?, locale?)`,
`getItemGrants(slug, system?)`, `isItemStackable(entry)`, `canEquipItem(slug, slotId, system?)`.
Exported from [`src/index.ts`](src/index.ts).

### Authoring checklist — new item

1. **Choose a slug** — kebab-case, stable (do not rename after publication).
2. **Add an entry** to [`itemGrants.dnd.ts`](src/curation/itemGrants.dnd.ts) in the `dndItems` array.
3. **Set `allowedSlots`** — each ID must exist in [`equipmentSlots.dnd.ts`](src/curation/equipmentSlots.dnd.ts). Pilot slots: `armor`, `main-hand`, `off-hand`, `neck`, `ring`.
4. **Set `stackable`** — `false` for unique gear; `true` or omit for stackable pilot items (e.g. scrolls).
5. **Author `grants`** — `choose: 0` only in the pilot. Supported types:
   - `stat_modifier` — `targetStat` must be a valid `StatKey` (`strength`, `hitPoints`, `armorClass`, …).
   - `spell` — `options[].ref` must exist in the spell catalog.
   - `ability` — `description` becomes a fixed ability grant.
   - **Do not use** in the pilot: `resource`, `language` with `choose > 0`, proficiencies (no end-to-end validation yet).
6. **New equipment slot** (if needed): add to `equipmentSlots.dnd.ts` and overlay `equipmentSlots` in [`data/translations/pt-BR.json`](data/translations/pt-BR.json). The inventory UI (Etapa 6) consumes these slot IDs.
7. **pt-BR overlay** — `items.{slug}.name` (and `description` if translated) in [`data/translations/pt-BR.json`](data/translations/pt-BR.json).
8. **Update tests** — add the slug to the expected list in [`__tests__/itemGrants.test.ts`](__tests__/itemGrants.test.ts) and assert `allowedSlots` / `grants` as appropriate.
9. **Run tests** — `npm run test:packages` and `npm test -w rpv-front`.
10. **Manual smoke test** (after Etapa 6 UI): add to bag via store/UI, equip in the correct slot, confirm resolved stats/grants.

No engine or UI code changes required if existing grant types suffice.

### Pilot patterns (reference items)

| Pattern | Pilot item | Notes |
|---------|------------|-------|
| HP bonus | `amulet-of-vitality` | `stat_modifier` + `hitPoints` |
| Spell when equipped | `scroll-of-fire-bolt` | `spell` + ref `fire-bolt` |
| Weapon | `longsword` | `allowedSlots: ["main-hand"]`, `stackable: false` |
| Armor / shield | `leather-armor`, `shield` | `armorClass` modifier |

### Minimal example — item

```ts
{
  slug: "longsword",
  system: "dnd",
  name: "Longsword",
  description: "A well-balanced blade.",
  allowedSlots: ["main-hand"],
  stackable: false,
  grants: [
    { grantType: "stat_modifier", choose: 0, targetStat: "strength", amount: 1 },
  ],
}
```

### Rules and anti-patterns

- **Do not** add `if (slug === ...)` branches in the engine or web — express behavior via `Grant[]`.
- **Do not** assume bag items alter stats; only equipped slugs resolve modifiers/grants.
- **Do not** invent slot IDs (`hand`, `body`) — use IDs from `equipmentSlots.dnd.ts` (e.g. `main-hand`, not `hand`).
- **Do not** reference spells that are not in the catalog.
- Items are **not** included in `buildCatalog` yet; they live in hand-curated `*.dnd.ts` files.

### Out of scope (pilot / future work)

- **Background/class starting gear** — granting items into `selections.inventory.bag` or currency at character creation requires a future `inventory_item` grant primitive and build-time materialization (post–Etapa 6). Backgrounds today only resolve equipped-style grants (languages, proficiencies), not bag loot.
- **Currency** — `gold` / `silver` / `bronze` on the player form remain manual `systemData` until a wealth model exists.
- **Weight, attunement, consumable charges**, `choose > 0` on item grants, community publish API, moderation.

Add pt-BR names under `items` in [`data/translations/pt-BR.json`](data/translations/pt-BR.json).

## Rules

- **Content = data.** New content (items, classes, subclasses, races, …) is
  added as `Grant`/catalog data, not as new engine logic. If you find yourself
  writing `if (slug === "fighter")` in code, model it as data instead.
- **Tag the system.** System-specific files use a system suffix (`*.dnd.ts`). A
  future system (e.g. Pathfinder) adds its own source mappers and `*.pf2e.ts`
  curation files — without modifying `@rpv/domain`.
- **Reuse shared primitives.** Map content onto existing `Grant` / `Modifier` /
  `StatKey` / `CharacterGrant` shapes so content from different authors and
  sources interacts predictably. Extend primitives generically only when a truly
  new capability is required (and prefer doing the generic part in `@rpv/domain`).
- **Catalog references use slugs.** Grants reference catalog entries by slug;
  resolution against the catalog happens through the provided helpers.

## Exports & tests

- Public surface is re-exported from `src/index.ts`. Add new modules there.
- Tests live in `__tests__/`. Run with `npm run test:packages` from the repo root.
- Depends on `@rpv/domain`; the dependency only goes one way (content → domain,
  never the reverse).
