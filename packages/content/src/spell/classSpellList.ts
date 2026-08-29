import type { Locale } from "@rpv/domain";
import type { Grant } from "../grant/grant.types";
import type { SpellCatalogEntry } from "./spell.types";
import { listSpells } from "../catalog/bundled";

const SPELL_SLOT_REF = /^spell-slots-(\d+)$/;

/** Highest N with a `spell-slots-N` resource grant whose amount is > 0. */
export function maxSpellSlotLevelFromGrants(grants: Grant[]): number {
    let max = 0;

    for (const grant of grants) {
        if (
            grant.grantType !== "resource" ||
            !grant.ref ||
            (grant.amount ?? 0) <= 0
        ) {
            continue;
        }

        const match = SPELL_SLOT_REF.exec(grant.ref);
        if (match) {
            max = Math.max(max, Number(match[1]));
        }
    }

    return max;
}

export function listFixedSpellRefsFromGrants(grants: Grant[]): string[] {
    const refs: string[] = [];

    for (const grant of grants) {
        if (grant.grantType !== "spell" || grant.choose !== 0) {
            continue;
        }

        if (grant.ref) {
            refs.push(grant.ref);
        }

        for (const option of grant.options ?? []) {
            if (option.optionType === "spell") {
                refs.push(option.ref);
            }
        }
    }

    return refs;
}

/** Class spell list from 1st level through `maxSlotLevel` inclusive. */
export function listClassListSpells(
    classSlug: string,
    maxSlotLevel: number,
    locale?: Locale
): SpellCatalogEntry[] {
    if (maxSlotLevel < 1) {
        return [];
    }

    return listSpells(locale).filter(
        (spell) =>
            spell.spellLists.includes(classSlug) &&
            spell.levelInt >= 1 &&
            spell.levelInt <= maxSlotLevel
    );
}
