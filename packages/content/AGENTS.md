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
  (`npm run build:catalog`). Spell persistence is the **merged** `SpellCatalogEntry`
  (`shortDescription` plus `rollProfile` / `displayMeta` from
  `spellCombat.dnd.ts` / `spellDisplay.dnd.ts`). Item persistence is the Open5e
  mapper output merged with `itemOverlays.dnd.ts` at runtime via `mergeItemCatalog`.
  Weapon `range`/`longRange` come from Open5e fields or, when those are null,
  from Ammunition/Thrown `properties[].detail` (e.g. `"range 150/600"`).
- `grant/` — the **`Grant`** model: the declarative description of what a piece
  of content gives a character.
  - `grantType`: `ability_score | stat_modifier | ability | skill_proficiency |
    skill_expertise | weapon_proficiency | tool_proficiency | armor_proficiency |
    saving_throw_proficiency | language | spell | resource | inventory_item |
    currency | armor_class_formula`
  - `choose === 0` → fixed (everything applies); `choose > 0` → the player picks
    `choose` entries from `options` or from a `selectionFilter` pool.
  - `armor_class_formula` — unarmored AC (`amount` base + `stat` options). **Not**
    a `CharacterGrant` (same as `stat_modifier` / `inventory_item`). Consumed by
    `computeEquippedArmorClass` when no body armor is worn.
  - Spell `selectionFilter`: `levelInt` = exact match (cantrips use `0`);
    `levelIntMax` = inclusive upper bound for leveled picks
    (`spell.levelInt` in `[1, levelIntMax]`). If both are set, `levelInt` wins.
  - `skill_expertise` maps to `kind: "proficiency"` with `proficiencyScale: 2`.
    `skill_proficiency` omits scale (= 1). If both grants exist for the same
    skill `ref`, the higher scale wins. `selectionFilter.fromProficientSkills`
    is resolved by the consumer that has character state (not `resolveGrantPool`).
  - `grants.ts` is the **bridge**: it converts `Grant`s into domain `Modifier`s
    and `CharacterGrant`s. This is how authored content feeds the engine. Keep
    this translation generic — driven by the grant data, not by hardcoded names.
  - `activation?` on an `ability` grant (`{ cost: string, resourceRef?: string }`)
    opts the feature into the combat sheet. Omitted abilities are traits only
    (overview / Features & Traits). `cost` is an opaque slug:
    `action` / `bonus` / `reaction` / `special` appear in the Actions catalog;
    `passive` appears in combat Reminders (not as a useable action). A resource
    pool is a separate `grantType: "resource"` (e.g. Ki points); do not put
    `activation` on the named pool ability. Do not infer combat membership from
    the feature name.
    - Use an actionable cost only if the player **declares this feature on
      their turn** (or as a reaction). “When you hit…”, “while raging…”,
      “whenever you take the Attack action…” are riders: `passive` or omit
      `activation`. `resourceRef` only if **this** grant spends the pool
      (Flurry of Blows spends ki; Open Hand Technique does not). Same shape
      as Rage (actionable) vs Frenzy (rider).
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
  - `prepared-list` — prepare from the full class list up to current max slot
  - `spellbook` — learn into a book; prepare a subset to cast
  - `pact` — known spells; slots are a separate pact pool (`ref` + `display: "slots"`, not `spell-slots-N`)
  - omitted — no preparation rules (non-casters)
- Ability Score Improvement is a class `ability_score` `choose` grant at the
  levels listed in `featuresByLevel` (fighter: 4/8/12/16/19). Do not special-case
  class slugs in the web app.
- `grantType: "resource"` may set `recoverOn` (`short_rest` | `long_rest`),
  `display` (`slots` | `counter`), and `slotLevel`. These copy onto
  `CharacterGrant.resource`.
- `preparedQuota?` — `level-plus-mod` (default when `spellcastingAbility` is set)
  or `half-level-plus-mod`. Cleric uses the default; paladin would set half later.

Helpers: `getClassGrants(slug, level)`, `getClassGrantSourcesForLevel`,
`getClassSubclassLevel`, `getClassSpellcastingMode`, `getClassPreparedQuotaKind`.
Class-list helpers: `listClassListSpells`, `maxSpellSlotLevelFromGrants`,
`listFixedSpellRefsFromGrants`.

**Cleric pilot (L1–3):** `spellcastingAbility: "wisdom"`, `spellcastingMode:
"prepared-list"`, `subclassLevel: 1`. Cantrips are `choose` from `spellLists:
["cleric"]`. Life domain (`cleric-life`) grants bless and cure wounds as
`choose: 0` spells. Keep the Unarmored Defense **ability** (text) even when an
`armor_class_formula` grant supplies the number (barbarian / monk).

### System combat grants ([`systemGrants.dnd.ts`](src/curation/systemGrants.dnd.ts))

Universal actions every D&D character has (Dash, Dodge, Grapple, …). These are
`ability` grants with `activation`, sourced as
`{ type: "system", id: "dnd-basic-combat" }` by the web pipeline — **not** copied
onto each class. Helper: `getSystemCombatGrants(system)` (empty for unknown
systems). Unarmed Strike is **not** a grant; it is a natural weapon (below).

### Natural weapons ([`naturalWeapons.dnd.ts`](src/curation/naturalWeapons.dnd.ts))

Always-available attacks that are **not** `ItemEntry`s (they must not appear in
`listItems` / inventory). Helper: `getNaturalWeapons(system, locale?)`. Unarmed
Strike: Strength, always proficient, damage `1 + Strength` (no die). Locale
overlay uses `features.{slug}` (`name` / `description`).

### `SubclassEntry` ([`subclassGrants.dnd.ts`](src/curation/subclassGrants.dnd.ts))

- Namespaced slugs: `fighter-champion`, `wizard-evocation`, `cleric-life`.
- `classSlug` must match the parent class.
- `grants` (base) + optional `featuresByLevel` (e.g. L3 feature).

### `BackgroundEntry` ([`backgroundGrants.dnd.ts`](src/curation/backgroundGrants.dnd.ts))

- `grants` — mechanical grants (skills, languages, tools, abilities, starting loot).
- `flavorTables?` — optional suggested narrative tables (`FlavorTable` in
  [`flavorTable.types.ts`](src/curation/flavorTable.types.ts)). These are **not**
  `Grant`s: they do not produce `CharacterGrant`s and do not use `grantPicks`.
  `bindTo` is an optional form/`systemData` field name; `roll` is a UI hint
  (`"d8"`, `"d20"`). Locale overlays may replace `option.label` by option slug
  (`backgrounds.{slug}.flavorTables.{tableSlug}.options.{optionSlug}` in
  `data/translations/*.json`). Missing table or option keys fall back to the
  English label so partial overlays never render blank. Overlay never changes
  `slug`, `bindTo`, `pickCount`, `roll`, or `allowCustom`. The picker persists
  the visible label, not the slug.

Helpers: `getBackgroundGrants(slug)` (grants only), `getBackground(slug, locale?)`.

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
    { level: 2, grants: [
      { grantType: "resource", choose: 0, ref: "action-surge-uses", amount: 1 },
      { grantType: "ability", choose: 0, description: "Action Surge", activation: { cost: "special", resourceRef: "action-surge-uses" } },
    ] },
    { level: 3, grants: [{ grantType: "skill_proficiency", choose: 1, description: "Additional skill", options: [...] }] },
  ],
}

// subclassGrants.dnd.ts
{
  slug: "fighter-champion",
  classSlug: "fighter",
  featuresByLevel: [
    { level: 3, grants: [{ grantType: "ability", choose: 0, description: "Improved Critical", activation: { cost: "passive" } }] },
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
[`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) (Inventory contract) and
[`docs/INVENTORY.md`](../../docs/INVENTORY.md) (full model). Only **equipped single**
slugs feed `collectGrantSources` and armor AC formulas; bag-only items and
`equippedMulti` do not alter stats. Which item may go in which slot is determined
by **`ItemEquipPolicy`** + `canEquipItem` (Etapa 1), not ad hoc UI rules.

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
  equipPolicy?: ItemEquipPolicy;  // optional override; see Item equip policy
}
```

- `weapon` / `armor` — combat and AC data from Open5e (AC uses `acBase` + Dex rules).
- `grants` — bonuses/abilities when **equipped** (single slots). For one-shot use
  from the bag (scrolls, potions), prefer `ability` + `activation` (future consumable
  flow) instead of passive `spell` grants while equipped.
- **`ItemEquipPolicy`** — data-driven rule for which slots an item may occupy.
  Derived from `weapon`, `armor`, `grants`, and `category.key`; overridable via
  `equipPolicy` on the entry or in `itemEntryOverrides`.
- **Combat attack list membership** is data-driven via `itemProvidesWeaponAttack`
  (`weapon != null`). Only hand slots (`melee-main`, `melee-off`, `ranged-main`,
  `ranged-off`) feed inventory attacks; the multi `usable` slot does **not**.
  - Attack on Combat / Overview → fill `weapon`.
  - Defense / AC only → fill `armor` (shield: `armor.category: "shield"`); does
    **not** appear as an attack even in a hand slot.
  - Declared use on your turn → `ability` grant with `activation` (not inferred
    from category or slot). **Do not** model consumables as “equip to use”.

Helpers: `getItem`, `listItems`, `getItemGrants`, `isItemStackable`,
`itemProvidesWeaponAttack`, `mapOpen5eItem`, `mergeItemCatalog`,
`resolveItemEquipPolicy`, `canEquipItem`, `getEquipableSlotIds` (Etapa 1). Exported from
[`src/index.ts`](src/index.ts).

### Item equip policy

Policy enum (`ItemEquipPolicy`): `carried | cosmetic | wieldable | shield | wearable | granted`.

| Policy | Meaning | Example slots |
|--------|---------|---------------|
| `carried` | Bag only — no equip | Waterskin, rope, tools |
| `cosmetic` | `equippedMulti.cosmetic` — no mechanics | Clothes, robes, mundane ring |
| `wieldable` | Hand slots single | Longsword, staff |
| `shield` | Off-hand shield | `srd_shield` |
| `wearable` | Wearable single slots | Breastplate, wondrous item |
| `granted` | Wearable + hands — items with grants but no weapon/armor | Magic amulet; override per item as needed |

**Derivation order** (first match wins): `weapon` → `shield` → body `armor` →
`grants.length > 0` → clothes/robes heuristic → ring without grants → wondrous-item →
default `carried` for adventuring gear / tools / ammunition / etc.

Implementation: `src/curation/itemEquipPolicy.dnd.ts` (Etapa 1 — planned).
Full spec: [`docs/INVENTORY.md`](../../docs/INVENTORY.md).

**Overrides:** set `equipPolicy` on `ItemEntry` or in `itemEntryOverrides`. Example:
`rpv_scroll-of-fire-bolt` → `wieldable` (pilot only; target model is use-from-bag).

**Anti-patterns:**

- Do not require equip for adventuring gear (`carried`).
- Do not use passive `spell` grants on scrolls long-term — use `activation` + consume qty.
- Do not branch on slug in web/engine — use policy + grants data.

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
| HP bonus | `rpv_amulet-of-vitality` | overlay `stat_modifier` + `hitPoints`; equip in wearable slot |
| Scroll (pilot) | `rpv_scroll-of-fire-bolt` | **Temporary:** passive `spell` grant while equipped; `equipPolicy: wieldable`. Target: `carried` + **Use** with `activation` |
| Weapon | `srd_longsword` | nested `weapon` profile |
| Armor | `srd_leather-armor` | nested `armor` → AC formula |
| Shield | `srd_shield` | overlay fills `armor.category: "shield"`, `acBase: 2`; not an attack |
| Carried gear | `srd_waterskin` | policy `carried`; bag only |
| Cosmetic | `srd_clothes-travelers` | policy `cosmetic`; slot `cosmetic` multi |

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
into `selections.inventory.bag` and `selections.grantedCurrency` (wizard preview)
is implemented in the web pipeline. First create also seeds `selections.currency`
(the playable pouch).

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

`ref` is a generic currency unit. D&D 5e denominations live in
[`currencies.dnd.ts`](src/curation/currencies.dnd.ts): `platinum`, `gold`,
`electrum`, `silver`, `copper` (legacy `bronze` migrates to `copper`). Starting
wealth grants typically use `gold`. No D&D logic in `@rpv/domain`. The playable
wallet is `selections.currency` (web); `grantedCurrency` is wizard preview only.

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
- **Do not** invent slot IDs (`hand`, `body`) — use IDs from `equipmentSlots.dnd.ts` (e.g. `melee-main`, not `hand`). Wearable: `helmet`, `cloak`, `breast`, `gloves`, `boots`, `amulet`, `ring`, `ring-2`. Usable: `melee-main`, `melee-off`, `ranged-main`, `ranged-off`, `usable`. Cosmetic multi: `cosmetic`.
- **Do not** strip Open5e key prefixes for inventory/grant refs — keep `srd_*` / `rpv_*`.
- **Do not** reference spells that are not in the catalog.
- SRD items are built into `catalog.json`; RPV extras/overrides stay in `itemOverlays.dnd.ts`.

### Out of scope (next etapas)

- **`selectionFilter` item pools** — `itemCategory` / `itemTags` (v2).
- **Dice-roll UI for starting gold** — optional button; fixed/choice amounts work today.
- **Weight, attunement, consumable charges**, community publish API, moderation.
- **Consumable use from bag** — scrolls/potions via `activation`; see [`docs/INVENTORY.md`](../../docs/INVENTORY.md).
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
the default D&D repository. **Grant resolution** (`grants.ts`,
`getClassGrantSourcesForLevel`, …) reads entries via `getContentRepository(system)`,
not by importing `*.dnd.ts` maps. Race ASI/language overlays live on
`RaceCatalogEntry.levelGrants` from `getRace`. Other lookups the sheet needs
(`listEquipmentSlots`, `listCurrencies`, `getNaturalWeapons`, `getSystemCombatGrants`,
`getEquipmentPack`, `listFeats`, `listConditions` / `getCondition`) are
repository methods. The interface stays **synchronous** (`@future async` is a
comment only).

Pilot conditions are hand-curated in [`conditions.dnd.ts`](src/curation/conditions.dnd.ts)
(`ConditionEntry`: name, optional `grants`, `rollEffects` for extra dice /
advantage / disadvantage). They are **not** in `catalog.json`. Active slugs live
on `StoredCharacter.session.activeConditions`; rest does not clear them.

The web app must call [`contentRepo(stored.system)`](../../apps/web/lib/content/contentRepository.ts)
rather than `dndRaceLevelGrants` / other curation maps.

### Future Supabase contract

A `SupabaseContentRepository` will implement the same `ContentRepository`
interface. Swap via `getContentRepository` — no changes to grant resolution or
character pipeline logic.

Persist the same JSON shapes as curation/catalog types:

| Entity | Type | Notes |
|--------|------|-------|
| Class | `ClassEntry` | `grants`, `featuresByLevel`, `hitDie`, `subclassLevel`, `spellcastingMode`, `preparedQuota` |
| Subclass | `SubclassEntry` | `classSlug`, `grants`, `featuresByLevel` |
| Background | `BackgroundEntry` | `grants`, optional `flavorTables` |
| Item | `ItemEntry` | Open5e-shaped; `grants`, weapon/armor, `stackable`, `category` |
| Race / spell | `RaceCatalogEntry`, `SpellCatalogEntry` | Open5e-mapped catalog rows |
| Condition | `ConditionEntry` | Curated `*.dnd.ts`; `rollEffects` + optional `grants` |

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
