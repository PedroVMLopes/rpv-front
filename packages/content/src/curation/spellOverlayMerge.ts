import type { SpellCatalogEntry } from "../spell/spell.types";
import { dndSpellRollProfiles } from "./spellCombat.dnd";
import { dndSpellDisplayMeta } from "./spellDisplay.dnd";

/** Fills combat/display overlays when the catalog entry omitted them. */
export function withSpellOverlays(entry: SpellCatalogEntry): SpellCatalogEntry {
    return {
        ...entry,
        rollProfile: entry.rollProfile ?? dndSpellRollProfiles[entry.slug],
        displayMeta: entry.displayMeta ?? dndSpellDisplayMeta[entry.slug],
    };
}
