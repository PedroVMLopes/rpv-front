# `@rpv/domain` — Agent Context

The **system-agnostic engine**. Read the root `AGENTS.md` first for the project
philosophy. This file covers the rules specific to this package.

## Hard rule: no system-specific knowledge here

Nothing in `packages/domain` may reference D&D (or any single system) — no rule
text, no class/race names, no magic numbers tied to a system, no
`if (system === ...)` branches. This package only knows generic primitives and
how to resolve them. System-specific facts belong in `@rpv/content`
(`curation/*.dnd.ts`), never here.

If a feature seems to require system-specific logic in the engine, that's a
design smell — generalize the primitive or move the specifics into content.

## What lives here

- `stats/statKey.ts` — `StatKey`, `Stats`, `createDefaultStats`. The generic,
  extensible set of modifiable stats. Stat keys for multiple systems can coexist
  here; content supplies the *values*, the engine never hardcodes them.
- `modifiers/` — the `Modifier` primitive and resolution pipeline. A modifier is
  pure data: `{ id, stat, operation, value, source, duration, stacking, priority }`.
  - `operation`: `add | multiply | set | sub`
  - `stacking`: `stack | replace | ignore-if-duplicate | ignore-if-higher`
  - `source`: `{ type, id }` where type ∈ `race | class | item | background |
    spell | condition | feat | system`
  - `duration`: permanent / temporary / condition-bound
  - `modifier.resolver.ts` applies modifiers deterministically:
    duration filtering → stacking resolution → operations in order
    `set → multiply → add → sub`, priority-sorted (ascending) within a group.
- `grants/` — `CharacterGrant`: the resolved things a character has (kinds:
  `language | ability | proficiency | saving_throw | spell | resource`), each carrying its
  `source`.
- `character/` — the `Character` aggregate and its types.
- `i18n/locale.ts` — locale primitives.

## Design guidance

- Keep primitives **generic and data-described**. Prefer string slugs / typed
  enums that any system can populate over D&D-specific shapes.
- When extending a primitive, ask whether it holds for a non-D&D system. If a
  capability is genuinely system-specific, it does not belong in this package.
- Resolution must stay deterministic and order-defined — content authored by
  different users must combine predictably.

## Exports & tests

- Public surface is re-exported from `src/index.ts`. Add new modules there.
- Tests live in `__tests__/`. Run with `npm test` in this package.
