# RPV — Agent Context

This file is the source of truth for *why* this codebase is shaped the way it is.
Read it before adding any feature. The principles below are non-negotiable
foundations; new work must respect them or explicitly propose changing them.

## What we are building

A platform for **creating and consuming tabletop-RPG content**. Users build
content (items, classes, subclasses, races, spells, feats, conditions, …) and
other users consume it. The community — not us — authors most of the content
over time.

We are launching on **D&D (5e / SRD via Open5e)**, but D&D is just the first
*system*. More RPG systems will be added later. Treat D&D as one pluggable
data set, never as "the rules".

## Core principles

1. **System-agnostic core.** Engine logic (how stats are computed, how bonuses
   stack, how grants resolve) must not know about D&D. It operates on generic,
   data-described primitives. Anything that names a specific system belongs in
   content/curation, not in the core.

2. **Content is data, not code.** Things that change numbers or grant abilities
   (items, classes, races, spells, …) are expressed as **declarative data**
   (`Grant`, `Modifier`, catalog entries) that the engine interprets. We do
   **not** hard-code per-item/per-class logic. If a community member could
   plausibly author it, it must be representable as data, not a code branch.

3. **Content interacts through shared primitives.** Different pieces of content
   (a racial trait, a magic item, a class feature, a temporary condition) all
   produce the same kinds of primitives (`Modifier`s targeting a `StatKey`,
   `Grant`s referencing catalog slugs). This is what lets unrelated content
   created by different authors combine and interact predictably.

4. **No system-specific hardcoding.** Do not embed magic numbers, rule text, or
   "if class === 'fighter'" logic in the engine or UI. Drive everything from
   data + the shared resolution rules. System-specific facts live in clearly
   named curation files (e.g. `*.dnd.ts`).

5. **Design for many systems.** When adding a primitive, ask: "will this still
   make sense for a system that isn't D&D?" Prefer generic, extensible shapes
   (string-keyed slugs, enumerable types) over D&D-specific assumptions. When a
   concept truly is system-specific, isolate it behind a system tag/namespace.

## Architecture map

Monorepo (npm workspaces): `apps/*` + `packages/*`.

### `packages/domain` — `@rpv/domain` (system-agnostic engine)
The generic core. **No D&D specifics may live here.** Key pieces:
- `stats/statKey.ts` — `StatKey`, `Stats`, defaults. The generic set of
  modifiable stats. (See the note in that file: stat keys for many systems can
  coexist here; only the *values* change per content.)
- `modifiers/` — the `Modifier` model and resolution pipeline:
  `Modifier { stat, operation, value, source, duration, stacking, priority }`.
  - `operation`: `add | multiply | set | sub`
  - `stacking`: `stack | replace | ignore-if-duplicate | ignore-if-higher`
  - `source`: typed origin (`race | class | subclass | item | background | spell |
    condition | feat | system`)
  - `duration`: permanent / temporary / condition-bound
  - `resolveStats(...)` applies them in a deterministic order
    (duration filter → stacking → `set → multiply → add → sub`, priority-sorted).
- `grants/` — `CharacterGrant`: what a character actually ends up with
  (languages, proficiencies, abilities, spells, **resources**), each tied back to a `source`.
- `character/` — the `Character` aggregate.

### `packages/content` — `@rpv/content` (content sources + system curation)
Where content lives and where system-specific curation is allowed.
- `open5e/` — client + types for the Open5e data source.
- `spell/`, `race/` — types and mappers that turn raw source data into catalog
  entries.
- `catalog/` — the assembled `Catalog` (races, spells, skills, languages) plus
  locale overlays for translations. Built via `scripts/buildCatalog.ts`.
- `grant/` — the **`Grant`** model (the declarative "what this content gives
  you") and `grants.ts`, which translates `Grant`s into domain `Modifier`s /
  `CharacterGrant`s. This is the bridge between authored content and the engine.
- `curation/*.dnd.ts` — **hand-curated, D&D-specific** data (class/race/
  background/item grants). The `.dnd.ts` suffix marks system-specific content.
  A new system would add its own curation files (e.g. `*.pf2e.ts`) without
  touching the engine.

### `apps/web` — Next.js consumer
Renders catalogs, character builders, and content. Consumes `@rpv/domain` and
`@rpv/content`; it should rely on engine resolution rather than re-implementing
rules. UI must stay system-agnostic and data-driven for the same reasons.

For the end-to-end character build pipeline (level, subclass gating, grant picks,
resources), see [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md). Derived class resources
(spell slots, rage, ki) preview live on the player form via `ClassResourcesField`
and display on the character sheet via `DerivedResourcesDisplay`. Web tests
(`npm test -w rpv-front`) are the primary integration coverage; package tests run
via root `npm run test:packages`.

## Adding a new system (the litmus test)

A future system should slot in by:
1. Adding a content **source** + mappers under `packages/content` (like
   `open5e/`).
2. Adding **curation files** with a system suffix (like `*.dnd.ts`).
3. Reusing the existing `Grant` / `Modifier` / `StatKey` primitives — extending
   them generically only if a genuinely new capability is needed.

If implementing a feature would require system-specific branching inside
`@rpv/domain`, stop: that is a signal the design is leaking. Push the
system-specific part into content/curation, or generalize the primitive.

## Conventions

- Content that changes numbers/abilities → express as `Grant` data, resolved
  into `Modifier`s/`CharacterGrant`s. Don't special-case it in the engine.
- System-specific data files use a system suffix (`*.dnd.ts`).
- Catalog text is authored in a default locale with partial locale overlays;
  missing translations fall back, so never assume a field is localized.
- Tests live in `__tests__/` per package; run `npm test` in the relevant package.

See `packages/domain/AGENTS.md` and `packages/content/AGENTS.md` for the rules
that apply when editing those packages specifically.
