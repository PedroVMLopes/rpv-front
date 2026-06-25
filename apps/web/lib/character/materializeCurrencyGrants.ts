import type { Locale } from "@rpv/domain";
import {
    aggregateCurrencyByRef,
    extractCurrencyGrants,
    type CurrencyGrantEntry,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { collectGrantSources } from "./characterGrants";
import type { CharacterSelections, StoredCharacter } from "./storedCharacter";

export const STARTING_EQUIPMENT_SOURCES = new Set(["background", "class"]);

function coerceCurrencyAmount(value: unknown): number {
    if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === "string" && value !== "") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

export function materializeCurrencyGrants(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel: number
): Record<string, number> {
    const entries: CurrencyGrantEntry[] = [];

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel
    )) {
        if (!STARTING_EQUIPMENT_SOURCES.has(entry.source.type)) {
            continue;
        }

        entries.push(...extractCurrencyGrants(entry.grants));
    }

    return aggregateCurrencyByRef(entries);
}

export function getManualCurrency(
    systemData: Record<string, unknown>
): Record<string, number> {
    return {
        gold: coerceCurrencyAmount(systemData.gold),
        silver: coerceCurrencyAmount(systemData.silver),
        bronze: coerceCurrencyAmount(systemData.bronze),
    };
}

export function getTotalCurrency(
    stored: StoredCharacter
): Record<string, number> {
    const manual = getManualCurrency(stored.systemData);
    const granted = stored.selections.grantedCurrency ?? {};
    const refs = new Set([...Object.keys(manual), ...Object.keys(granted)]);
    const totals: Record<string, number> = {};

    for (const ref of refs) {
        totals[ref] = (manual[ref] ?? 0) + (granted[ref] ?? 0);
    }

    return totals;
}
