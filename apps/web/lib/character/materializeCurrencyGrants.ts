import type { Locale } from "@rpv/domain";
import {
    aggregateCurrencyByRef,
    resolveCurrencyGrants,
    type CurrencyGrantEntry,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { collectGrantSources } from "./characterGrants";
import { filterStartingGrantsForEntry } from "./startingEquipmentGrants";
import type { CharacterSelections, StoredCharacter } from "./storedCharacter";

export const STARTING_EQUIPMENT_SOURCES = new Set(["background", "class"]);

/** Wizard extras + legacy systemData keys. `bronze` aliases to `copper`. */
export const CURRENCY_FORM_REFS = [
    "platinum",
    "gold",
    "electrum",
    "silver",
    "copper",
] as const;

export const LEGACY_CURRENCY_SYSTEM_DATA_KEYS = [
    "gold",
    "silver",
    "bronze",
    "copper",
    "electrum",
    "platinum",
] as const;

const CURRENCY_REF_ALIASES: Record<string, string> = {
    bronze: "copper",
};

function coerceCurrencyAmount(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.max(0, Math.floor(value));
    }
    if (typeof value === "string" && value !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return Math.max(0, Math.floor(parsed));
        }
    }
    return 0;
}

function canonicalizeCurrencyRef(ref: string): string | undefined {
    const normalized = ref.trim().toLowerCase();
    if (!normalized) {
        return undefined;
    }
    return CURRENCY_REF_ALIASES[normalized] ?? normalized;
}

export function sanitizeCurrency(wallet: unknown): Record<string, number> {
    if (!wallet || typeof wallet !== "object" || Array.isArray(wallet)) {
        return {};
    }

    const totals: Record<string, number> = {};

    for (const [rawKey, value] of Object.entries(
        wallet as Record<string, unknown>
    )) {
        const ref = canonicalizeCurrencyRef(rawKey);
        if (!ref) {
            continue;
        }

        totals[ref] = (totals[ref] ?? 0) + coerceCurrencyAmount(value);
    }

    return totals;
}

export function mergeCurrencyTotals(
    ...maps: Record<string, number>[]
): Record<string, number> {
    const totals: Record<string, number> = {};

    for (const map of maps) {
        for (const [ref, amount] of Object.entries(map)) {
            const canonical = canonicalizeCurrencyRef(ref);
            if (!canonical) {
                continue;
            }
            totals[canonical] = (totals[canonical] ?? 0) + coerceCurrencyAmount(amount);
        }
    }

    return totals;
}

export function hasCurrencyWallet(
    selections: Pick<CharacterSelections, "currency"> | undefined
): boolean {
    return selections?.currency !== undefined;
}

/** Form extras for wizard seed / preview. Maps legacy `bronze` into `copper`. */
export function getManualCurrency(
    formOrSystemData: Record<string, unknown>
): Record<string, number> {
    const extras: Record<string, number> = {};

    for (const ref of CURRENCY_FORM_REFS) {
        const value = formOrSystemData[ref];
        if (value === undefined || value === "") {
            continue;
        }
        extras[ref] = coerceCurrencyAmount(value);
    }

    const bronze = formOrSystemData.bronze;
    if (bronze !== undefined && bronze !== "") {
        extras.copper =
            (extras.copper ?? 0) + coerceCurrencyAmount(bronze);
    }

    return extras;
}

export function seedCurrencyFromGrantsAndExtras(
    granted: Record<string, number> | undefined,
    extras: Record<string, unknown>
): Record<string, number> {
    return mergeCurrencyTotals(granted ?? {}, getManualCurrency(extras));
}

export function stripLegacyCurrencySystemData(
    systemData: Record<string, unknown>
): Record<string, unknown> {
    const next = { ...systemData };
    for (const key of LEGACY_CURRENCY_SYSTEM_DATA_KEYS) {
        delete next[key];
    }
    return next;
}

export function resolveCurrencyWallet(
    selections: CharacterSelections,
    extras: Record<string, unknown>
): Record<string, number> {
    if (hasCurrencyWallet(selections)) {
        return sanitizeCurrency(selections.currency);
    }

    return seedCurrencyFromGrantsAndExtras(selections.grantedCurrency, extras);
}

export function setCurrencyAmount(
    wallet: Record<string, number> | undefined,
    ref: string,
    amount: unknown
): Record<string, number> {
    const next = sanitizeCurrency(wallet ?? {});
    const canonical = canonicalizeCurrencyRef(ref);
    if (!canonical) {
        return next;
    }

    next[canonical] = coerceCurrencyAmount(amount);
    return next;
}

export function adjustCurrencyAmount(
    wallet: Record<string, number> | undefined,
    ref: string,
    delta: number
): Record<string, number> {
    const current = sanitizeCurrency(wallet ?? {});
    const canonical = canonicalizeCurrencyRef(ref);
    if (!canonical) {
        return current;
    }

    return setCurrencyAmount(
        current,
        canonical,
        (current[canonical] ?? 0) + delta
    );
}

export function materializeCurrencyGrants(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel: number
): Record<string, number> {
    const entries: CurrencyGrantEntry[] = [];
    const grantPicks = selections.choices.grantPicks ?? {};

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel
    )) {
        if (!STARTING_EQUIPMENT_SOURCES.has(entry.source.type)) {
            continue;
        }

        const filtered = filterStartingGrantsForEntry(
            entry.grants,
            grantPicks,
            entry
        );

        entries.push(
            ...resolveCurrencyGrants(filtered, grantPicks, {
                sourceType: entry.source.type,
                sourceId: entry.source.id,
                featureLevel: entry.featureLevel,
            })
        );
    }

    return aggregateCurrencyByRef(entries);
}

export function getTotalCurrency(
    stored: StoredCharacter
): Record<string, number> {
    return sanitizeCurrency(stored.selections.currency ?? {});
}

export function formatCurrencyPreviewParts(
    currency: Record<string, number>,
    denoms: Array<{ ref: string; abbreviation: string }>
): string[] {
    if (denoms.length > 0) {
        return denoms
            .filter((denom) => (currency[denom.ref] ?? 0) > 0)
            .map((denom) => `${currency[denom.ref]} ${denom.abbreviation}`);
    }

    return Object.entries(currency)
        .filter(([, amount]) => amount > 0)
        .map(([ref, amount]) => `${amount} ${ref}`);
}

export function isCurrencyWalletRecord(
    value: unknown
): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
