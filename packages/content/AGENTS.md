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
  - Spell `selectionFilter`: `levelInt` = exact match (cantrips use `0`);
    `levelIntMax` = inclusive upper bound for leveled picks
    (`spell.levelInt` in `[1, levelIntMax]`). If both are set, `levelInt` wins.
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
- `spellcastingAbility?` — governing ability for spell attack / save DC.
- `spellcastingMode?` — how the class treats known vs castable spells:
  - `known` — spell grants are always castable
  - `prepared-list` — prepare from the full class list
  - `spellbook` — learn into a book; prepare a subset to cast
  - omitted — no preparation rules (non-casters)

Helpers: `getClassGrants(slug, level)`, `getClassGrantSourcesForLevel`,
`getClassSubclassLevel`, `getClassSpellcastingMode`.

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

SRD item **definitions** are imported from Open5e v2 (`/v2/items/`, document
`srd-2014`) into `catalog.json` via fixtures + [`scripts/buildCatalog.ts`](scripts/buildCatalog.ts).
Refresh fixtures with `npm run refresh:items -w @rpv/content`. RPV-only items and
overrides live in [`itemOverlays.dnd.ts`](src/curation/itemOverlays.dnd.ts).

Whether a character **owns** or **wears** an item is runtime state in
`selections.inventory` (bag / equipped) on the web app — see
[`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) (Inventory contract). Only
**equipped** slugs feed `collectGrantSources` and armor AC formulas; bag-only
items do not alter stats until equipped. The app does **not** gate which item
may go in which slot — the player decides.

### Identity

- Catalog `slug` **===** Open5e `key` (e.g. `srd_longsword`, `srd_leather-armor`).
- RPV extras use the `rpv_` namespace (e.g. `rpv_amulet-of-vitality`).
- Persist the field name `slug` on bag/equipped; values are these namespaced keys.
- Weapon proficiency refs (`longswords`, `martial-weapons`, …) are a separate
  vocabulary — do not rename them to item keys.

### `ItemEntry` contract

Aligned with Open5e v2 item shape (camelCase):

```ts
interface ItemEntry {
  slug: string;              // === Open5e key or rpv_*
  system: "dnd";
  name: string;
  description: string;
  category: { name: string; key: string };
  weapon: ItemWeapon | null;
  armor: ItemArmor | null;   // body armor or shield profile
  weight: string | null;
  weightUnit: string | null;
  cost: string | null;
  grants: Grant[];           // usually []; overlay for magic items
  stackable: boolean;        // false when weapon/armor present
}
```

- `weapon` / `armor` — combat and AC data from Open5e (AC uses `acBase` + Dex rules).
- `grants` — bonuses/abilities when **equipped** (RPV overlays for magic).
- No `allowedSlots` — any bag item may equip into any valid slot id.

Helpers: `getItem`, `listItems`, `getItemGrants`, `isItemStackable`,
`mapOpen5eItem`, `mergeItemCatalog`. Exported from [`src/index.ts`](src/index.ts).

### Authoring checklist — SRD refresh

1. Run `npm run refresh:items -w @rpv/content` then `npm run build:catalog -w @rpv/content`.
2. Confirm new keys appear in `data/catalog.json` `items[]`.
3. Update starting-equipment grant `ref`s to the Open5e keys if needed.
4. Add pt-BR overlays under `items.{slug}` when translating.
5. Run `npm run test:packages` and `npm test -w rpv-front`.

### Authoring checklist — RPV / magic overlay

1. Choose a `rpv_*` slug (stable).
2. Add a full `ItemEntry` to `rpvExtraItems` in [`itemOverlays.dnd.ts`](src/curation/itemOverlays.dnd.ts), or an override in `itemEntryOverrides` for an SRD slug.
3. Author `grants` (`choose: 0`) as needed (`stat_modifier`, `spell`, `ability`).
4. pt-BR overlay + tests.
5. Smoke: add to bag, equip, confirm resolved stats/grants/AC.

### Reference patterns

| Pattern | Slug | Notes |
|---------|------|-------|
| HP bonus | `rpv_amulet-of-vitality` | overlay `stat_modifier` + `hitPoints` |
| Spell when equipped | `rpv_scroll-of-fire-bolt` | overlay spell grant |
| Weapon | `srd_longsword` | nested `weapon` profile |
| Armor | `srd_leather-armor` | nested `armor` → AC formula |
| Shield | `srd_shield` | overlay fills `armor.category: "shield"`, `acBase: 2` |

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
  ref: "rpv_scroll-of-fire-bolt",
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
                { optionType: "item", ref: "rpv_pilot-test-dagger" },
                { optionType: "item", ref: "srd_longsword" },
  ],
}
```

#### `inventory_item` — SRD equipment pack (shared bundle)

Equipment packs are **not** `ItemEntry`s. They are named `inventory_bundle`
options that expand into separate bag stacks (SRD rule: choosing a pack grants
its listed gear). Shared definitions live in
[`equipmentPacks.dnd.ts`](src/curation/equipmentPacks.dnd.ts):

```ts
import {
  dungeoneersPackBundle,
  explorersPackBundle,
} from "./equipmentPacks.dnd";

{
  grantType: "inventory_item",
  choose: 1,
  description: "Adventuring pack",
  options: [dungeoneersPackBundle, explorersPackBundle],
}
```

Add future packs (Burglar, Priest, …) to `dndEquipmentPackBundles` and reuse
from any class grant. Do **not** author opaque `rpv_*-pack` ItemEntries for
starting equipment.

#### `inventory_item` — composite bundle option (inline)

```ts
{
  grantType: "inventory_item",
  choose: 1,
  description: "Starting loadout",
  options: [
        { optionType: "item", ref: "rpv_pilot-test-pack-a" },
        {
            optionType: "inventory_bundle",
            label: "Starter kit",
            items: [
                { ref: "srd_leather-armor", amount: 1 },
                { ref: "rpv_pilot-test-dagger", amount: 2 },
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
- **Do not** model SRD equipment packs as opaque `ItemEntry`s (`rpv_*-pack`) —
  use shared bundles in `equipmentPacks.dnd.ts`.
- **`rpv_pilot-test-*` slugs** are contract fixtures, not SRD content.

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

- **Do not** add `if (slug === ...)` branches in the engine or web — express behavior via `Grant[]` / item data.
- **Do not** assume bag items alter stats; only equipped slugs resolve modifiers/grants/AC.
- **Do not** invent slot IDs (`hand`, `body`) — use IDs from `equipmentSlots.dnd.ts` (e.g. `main-hand`, not `hand`). Wearable group: `armor`, `neck`, `ring`. Usable group: `main-hand`, `off-hand`, `usable`.
- **Do not** strip Open5e key prefixes for inventory/grant refs — keep `srd_*` / `rpv_*`.
- **Do not** reference spells that are not in the catalog.
- SRD items are built into `catalog.json`; RPV extras/overrides stay in `itemOverlays.dnd.ts`.

### Out of scope (next etapas)

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

## ContentRepository (read seam)

Content **lookup** (catalog entries + curation entries) goes through
[`ContentRepository`](src/repository/contentRepository.types.ts):

- [`StaticContentRepository`](src/repository/staticContentRepository.ts) — bundled
  `catalog.json` + hand-curated `*.dnd.ts` arrays (today).
- [`getContentRepository(system)`](src/repository/getContentRepository.ts) — factory;
  `"dnd"` is the only system registered now.

Legacy exports (`getClass`, `listItems`, `listSpells`, …) are thin wrappers over
the default repository. **Grant resolution** (`grants.ts`, `getClassGrants`, …)
stays outside the repository — it reads entries via those helpers.

### Future Supabase contract

A `SupabaseContentRepository` will implement the same `ContentRepository`
interface. Swap via `getContentRepository` — no changes to grant resolution or
character pipeline logic.

Persist the same JSON shapes as curation/catalog types:

| Entity | Type | Notes |
|--------|------|-------|
| Class | `ClassEntry` | `grants`, `featuresByLevel`, `hitDie`, `subclassLevel`, `spellcastingMode` |
| Subclass | `SubclassEntry` | `classSlug`, `grants`, `featuresByLevel` |
| Background | `BackgroundEntry` | `grants` |
| Item | `ItemEntry` | Open5e-shaped; `grants`, weapon/armor, `stackable`, `category` |
| Race / spell | `RaceCatalogEntry`, `SpellCatalogEntry` | Open5e-mapped catalog rows |

Locale overlays follow the partial-merge strategy in
[`data/translations/pt-BR.json`](data/translations/pt-BR.json). The backend stores
**data only** — no per-class resolution logic.

The web app reads content exclusively via
[`apps/web/lib/content/contentRepository.ts`](../../apps/web/lib/content/contentRepository.ts)
(`contentRepo()`), not by importing `catalog` or raw `dnd*` arrays.


- Public surface is re-exported from `src/index.ts`. Add new modules there.
- Tests live in `__tests__/`. Run with `npm run test:packages` from the repo root.
- Depends on `@rpv/domain`; the dependency only goes one way (content → domain,
  never the reverse).
