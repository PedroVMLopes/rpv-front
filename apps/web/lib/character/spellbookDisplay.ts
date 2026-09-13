import { getClassSpellcastingMode } from "@rpv/content";
import type { Locale, Stats } from "@rpv/domain";
import {
    buildSpellActionsFromGrants,
    listSpellActions,
    type SpellAction,
} from "./combatActions";
import { buildSpellcastingSystemData } from "./spellcastingContext";
import {
    computePreparedSpellQuotaForStored,
    prunePreparedSpellsToQuota,
} from "./preparedSpellQuota";
import type { StoredCharacter } from "./storedCharacter";

export type SpellbookDisplayEntry = {
    spell: SpellAction;
    /** False = known in the spellbook but not prepared (spellbook mode only). */
    castable: boolean;
};

function characterClassSlug(stored: StoredCharacter): string | undefined {
    return (
        stored.selections.characterClass ??
        (typeof stored.systemData.characterClass === "string"
            ? stored.systemData.characterClass
            : undefined)
    );
}

function wrapAllCastable(input: {
    cantrips: SpellAction[];
    spells: SpellAction[];
}): {
    cantrips: SpellbookDisplayEntry[];
    spells: SpellbookDisplayEntry[];
} {
    return {
        cantrips: input.cantrips.map((spell) => ({
            spell,
            castable: true,
        })),
        spells: input.spells.map((spell) => ({
            spell,
            castable: true,
        })),
    };
}

/**
 * Spell list for the Magic tab spellbook.
 *
 * - Non-`spellbook` modes: same as castable `listSpellActions` (all castable).
 * - `spellbook`: all known spell grants; leveled spells not in the prepared
 *   quota are included with `castable: false`. Cantrips stay castable.
 *   Within leveled spells, castable entries come first.
 */
export function listMagicSpellbookEntries(
    stored: StoredCharacter,
    resolved: Stats,
    locale?: Locale
): {
    cantrips: SpellbookDisplayEntry[];
    spells: SpellbookDisplayEntry[];
} {
    const classSlug = characterClassSlug(stored);
    const mode = classSlug ? getClassSpellcastingMode(classSlug) : undefined;

    if (mode !== "spellbook") {
        return wrapAllCastable(listSpellActions(stored, resolved, locale));
    }

    const { cantrips, spells } = buildSpellActionsFromGrants({
        grants: stored.grants ?? [],
        system: stored.system,
        locale,
        resolved,
        spellcastingSystemData: buildSpellcastingSystemData(stored),
    });

    const quota = computePreparedSpellQuotaForStored(stored);
    const preparedList =
        quota !== undefined
            ? (prunePreparedSpellsToQuota(
                  stored.selections.choices.preparedSpells,
                  quota
              ) ?? [])
            : (stored.selections.choices.preparedSpells ?? []);
    const prepared = new Set(preparedList);

    const leveled = spells
        .map((spell) => ({
            spell,
            castable: prepared.has(spell.slug),
        }))
        .sort((a, b) => {
            if (a.castable === b.castable) {
                return a.spell.name.localeCompare(b.spell.name);
            }
            return a.castable ? -1 : 1;
        });

    return {
        cantrips: cantrips.map((spell) => ({
            spell,
            castable: true,
        })),
        spells: leveled,
    };
}
