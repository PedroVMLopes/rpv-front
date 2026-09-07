import type { Locale } from "@rpv/domain";
import { getFixedRefsForGrantType } from "./characterGrants";
import { flattenStoredToForm } from "./presetStats";
import {
    nextPreparedSpellsAfterToggle,
} from "./preparedSpellForm";
import { computePreparedSpellQuotaForStored } from "./preparedSpellQuota";
import { listPrepareSpellPool } from "./knownLeveledSpells";
import { readPreparedSpells } from "./castableSpells";
import type { StoredCharacter } from "./storedCharacter";

function characterLevelFromStored(stored: StoredCharacter): number {
    const raw = stored.systemData.level;
    if (typeof raw === "number" && Number.isFinite(raw) && raw >= 1) {
        return Math.min(Math.floor(raw), 20);
    }
    return 1;
}

export function listSheetPrepareSpellPool(
    stored: StoredCharacter,
    locale: Locale
): string[] {
    return listPrepareSpellPool({
        selections: stored.selections,
        locale,
        system: stored.system,
        characterLevel: characterLevelFromStored(stored),
    });
}

export function listSheetLockedSpellRefs(
    stored: StoredCharacter,
    locale: Locale
): Set<string> {
    return getFixedRefsForGrantType(
        stored.selections,
        locale,
        "spell",
        characterLevelFromStored(stored),
        stored.system
    );
}

/**
 * Builds form payload for `updateCharacter` after toggling a prepared spell.
 */
export function buildPreparedSpellToggleFormData(
    stored: StoredCharacter,
    slug: string,
    locale: Locale
): Record<string, unknown> | null {
    const locked = listSheetLockedSpellRefs(stored, locale);
    if (locked.has(slug)) {
        return null;
    }

    const quota = computePreparedSpellQuotaForStored(stored) ?? 1;
    const current = readPreparedSpells(stored.selections.choices);
    const playerPrepared = current.filter((entry) => !locked.has(entry));
    const isSelected = playerPrepared.includes(slug);

    let nextPlayer: string[];
    if (!isSelected) {
        if (playerPrepared.length >= quota) {
            return null;
        }
        nextPlayer = nextPreparedSpellsAfterToggle(playerPrepared, slug, {
            quota,
        });
    } else {
        nextPlayer = nextPreparedSpellsAfterToggle(playerPrepared, slug);
    }

    const lockedPrepared = current.filter((entry) => locked.has(entry));
    const nextPrepared = [...lockedPrepared, ...nextPlayer];

    const formData = flattenStoredToForm(stored, stored.system);
    const choices =
        (formData.choices as Record<string, unknown> | undefined) ?? {};

    return {
        ...formData,
        choices: {
            ...choices,
            preparedSpells: nextPrepared,
        },
    };
}
