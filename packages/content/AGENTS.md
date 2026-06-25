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
    saving_throw_proficiency | language | spell | resource | inventory_item |
    currency`
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

Pilot catalog: 6 SRD pilot items plus 3 `pilot-test-*` contract fixtures in
[`itemGrants.dnd.ts`](src/curation/itemGrants.dnd.ts). Full item catalogs arrive
with Supabase-backed content later.

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
  category?: string;       // optional; future catalog filters (weapon, armor, pack, …)
  tags?: string[];         // optional; future catalog filters (martial, ranged, …)
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

### Starting equipment grants (Etapa 1 — data contract)

#### `ability_score` — fixed racial ASI

```ts
{ grantType: "ability_score", choose: 0, targetStat: "dexterity", amount: 2 }
```

#### `ability_score` — distributable racial ASI

Player picks `choose` distinct stats from `options` (pick value = stat slug):

```ts
{
  grantType: "ability_score",
  choose: 2,
  amount: 1,
  description: "Two other ability scores of your choice",
  options: [
    { optionType: "stat", ref: "strength" },
    { optionType: "stat", ref: "dexterity" },
    // …
  ],
}
```

Mixed fixed + distributable (half-elf): use `dndRaceAsiOverrides` in
[`raceGrants.dnd.ts`](src/curation/raceGrants.dnd.ts) — Open5e `asi[]` cannot
express flexible picks alone.

Alternative pool via filter:

```ts
{
  grantType: "ability_score",
  choose: 1,
  amount: 1,
  selectionFilter: { stats: ["intelligence", "wisdom"] },
}
```

Resolution: [`abilityScoreGrants.ts`](src/grant/abilityScoreGrants.ts). Pick keys:
`{sourceType}:{sourceId}:{levelSegment}:ability_score:{grantIndex}:{slot}`.

Declares starting gear and currency from class/background grants. Materialization
into `selections.inventory.bag` and `selections.grantedCurrency` is implemented
in the web pipeline ([`materializeInventoryGrants.ts`](../../apps/web/lib/character/materializeInventoryGrants.ts),
[`materializeCurrencyGrants.ts`](../../apps/web/lib/character/materializeCurrencyGrants.ts)).

#### `inventory_item` — fixed loot

```ts
{
  grantType: "inventory_item",
  choose: 0,
  ref: "scroll-of-fire-bolt",
  amount: 1,
}
```

#### `inventory_item` — player choice (single item per option)

```ts
{
  grantType: "inventory_item",
  choose: 1,
  description: "Starting weapon",
  options: [
    { optionType: "item", ref: "pilot-test-dagger" },
    { optionType: "item", ref: "longsword" },
  ],
}
```

#### `inventory_item` — composite bundle option

```ts
{
  grantType: "inventory_item",
  choose: 1,
  description: "Adventuring pack",
  options: [
    { optionType: "item", ref: "pilot-test-pack-a" },
    {
      optionType: "inventory_bundle",
      label: "Starter kit",
      items: [
        { ref: "leather-armor", amount: 1 },
        { ref: "pilot-test-dagger", amount: 2 },
      ],
    },
  ],
}
```

Pick value for bundles is the **option index** (same as single-item options).
`formatInventoryBundleLabel()` uses `label` when set, otherwise joins localized
item names with ` + `.

#### Independent equipment choices (SRD pattern)

SRD classes often require **several separate `choose: 1` grants** (armor pick,
weapon pick, pack pick), not one grant with `choose: N`. Each grant gets its own
`grantIndex` and pick keys. Combine with `exclusiveGroup` / `exclusiveBranch` when
equipment and gold are mutually exclusive (see below).

Example (Fighter equipment branch): fixed longsword + armor choice + loadout
choice + pack choice + sidearm choice — see [`classGrants.dnd.ts`](src/curation/classGrants.dnd.ts).

#### `currency` — starting wealth

Fixed:

```ts
{ grantType: "currency", choose: 0, ref: "gold", amount: 15, description: "Belt pouch" }
```

With player choice (`choose > 0`):

```ts
{
  grantType: "currency",
  choose: 1,
  options: [
    { optionType: "currency", ref: "gold", amount: 30, label: "30 gp" },
    { optionType: "currency", ref: "gold", amount: 50, label: "50 gp" },
  ],
}
```

`ref` is a generic currency unit (`gold`, `silver`, `bronze`). No D&D logic in
`@rpv/domain`.

#### Exclusive starting wealth groups (`exclusiveGroup` / `exclusiveBranch`)

SRD classes often grant **equipment OR gold**, not both. Tag grants with the same
`exclusiveGroup` and distinct `exclusiveBranch` values; only the selected branch
materializes.

```ts
// Branch "equipment"
{
  grantType: "inventory_item",
  choose: 0,
  ref: "longsword",
  exclusiveGroup: "starting-wealth",
  exclusiveBranch: "equipment",
}
// Branch "gold"
{
  grantType: "currency",
  choose: 0,
  ref: "gold",
  amount: 50,
  exclusiveGroup: "starting-wealth",
  exclusiveBranch: "gold",
}
```

**Pick key:** `{sourceType}:{sourceId}:{levelSegment}:exclusive:{exclusiveGroup}`  
**Pick value:** branch id (`"equipment"`, `"gold"`, …).

Helpers: [`exclusiveGroups.ts`](src/grant/exclusiveGroups.ts) —
`collectExclusiveGroupChoices`, `filterGrantsByExclusiveGroups`.

Pilot: Fighter in [`classGrants.dnd.ts`](src/curation/classGrants.dnd.ts).

#### `grantPicks` convention for equipment

Key format (same as other choice grants):

```
{sourceType}:{sourceId}:{levelSegment}:inventory_item:{grantIndex}:{slot}
```

**Pick value:** option **index as string** (`"0"`, `"1"`, …) — not item slug.
Unlike skill/spell picks, equipment uses index because bundle options expand to
multiple slugs.

Helpers in [`src/grant/inventoryGrants.ts`](src/grant/inventoryGrants.ts):
`buildInventoryItemChoiceKey`, `resolveInventoryItemGrants`,
`collectInventoryItemChoiceGrants`, `resolveInventoryItemPick`,
`isValidInventoryItemPick`, `flattenGrantOptionToEntries`.

Currency helpers in [`src/grant/currencyGrants.ts`](src/grant/currencyGrants.ts):
`extractCurrencyGrants`, `resolveCurrencyGrants`, `collectCurrencyChoiceGrants`,
`aggregateCurrencyByRef`, `currencyGrantProvenance`.

`resolveGrantPool` returns `inventoryOptions` (index + label) for
`inventory_item` grants with enumerated `options`. `selectionFilter.itemCategory`
/ `itemTags` are reserved (returns empty pool until v2).

#### Anti-patterns

- **Do not** use `optionType: "proficiency"` with item slugs — use `item` or
  `inventory_bundle`.
- **Do not** expect `inventory_item` or `currency` to produce `CharacterGrant`s.
- **`pilot-test-*` slugs** are contract fixtures, not SRD content.

### `inventory_item` grant (starting loot — web)

Class and background starting loot is materialized by the web pipeline
(`mergeStartingGrants`). Fixed grants (`choose: 0`) and player choices
(`choose > 0` via `grantPicks`) are supported. See
[`materializeInventoryGrants.ts`](../../apps/web/lib/character/materializeInventoryGrants.ts)
and [`deriveStartingEquipmentFromForm.ts`](../../apps/web/lib/character/deriveStartingEquipmentFromForm.ts).

- **Provenance:** `grant:{sourceType}:{sourceId}:{grantIndex}` on bag stacks.
- **Legacy helper:** `extractInventoryItemGrants` (fixed grants only; unchanged
  signature for web retrocompat).

### Rules and anti-patterns

- **Do not** add `if (slug === ...)` branches in the engine or web — express behavior via `Grant[]`.
- **Do not** assume bag items alter stats; only equipped slugs resolve modifiers/grants.
- **Do not** invent slot IDs (`hand`, `body`) — use IDs from `equipmentSlots.dnd.ts` (e.g. `main-hand`, not `hand`).
- **Do not** reference spells that are not in the catalog.
- Items are **not** included in `buildCatalog` yet; they live in hand-curated `*.dnd.ts` files.

### Out of scope (next etapas)

- **SRD item/class/background catalogs** — real content when Supabase is live.
- **`selectionFilter` item pools** — `itemCategory` / `itemTags` (v2).
- **Dice-roll UI for starting gold** — optional button; fixed/choice amounts work today.
- **Weight, attunement, consumable charges**, community publish API, moderation.
- **HTTP API** — [`docs/API_INVENTORY.md`](../../docs/API_INVENTORY.md).

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
