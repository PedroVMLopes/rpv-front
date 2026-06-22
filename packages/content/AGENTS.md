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
