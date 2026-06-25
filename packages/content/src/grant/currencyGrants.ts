import type { Grant, GrantOption } from "./grant.types";

export type CurrencyGrantEntry = {
    ref: string;
    amount: number;
    grantIndex: number;
};

export type CurrencyGrantResolveContext = {
    sourceType: string;
    sourceId: string;
    featureLevel?: number;
};

export type CurrencyChoiceGrant = {
    key: string;
    grant: Grant;
    grantIndex: number;
    slot: number;
    label: string;
};

function coerceCurrencyRef(ref: unknown): string | undefined {
    if (typeof ref !== "string") {
        return undefined;
    }

    const normalized = ref.trim().toLowerCase();
    return normalized.length > 0 ? normalized : undefined;
}

function levelSegment(featureLevel?: number): string {
    return featureLevel !== undefined ? String(featureLevel) : "base";
}

export function buildCurrencyChoiceKey(params: {
    sourceType: string;
    sourceId: string;
    grantIndex: number;
    slot: number;
    featureLevel?: number;
}): string {
    const segment = levelSegment(params.featureLevel);
    return `${params.sourceType}:${params.sourceId}:${segment}:currency:${params.grantIndex}:${params.slot}`;
}

export function currencyGrantProvenance(
    sourceType: string,
    sourceId: string,
    grantIndex: number
): string {
    return `grant:${sourceType}:${sourceId}:${grantIndex}`;
}

function parseOptionIndex(pickValue: string | undefined): number | undefined {
    if (pickValue === undefined || pickValue.trim() === "") {
        return undefined;
    }

    const index = Number.parseInt(pickValue, 10);
    if (!Number.isFinite(index) || index < 0) {
        return undefined;
    }

    return index;
}

function resolveCurrencyOption(
    option: GrantOption
): { ref: string; amount: number } | undefined {
    if (option.optionType !== "currency") {
        return undefined;
    }

    const ref = coerceCurrencyRef(option.ref);
    if (!ref) {
        return undefined;
    }

    const amount =
        typeof option.amount === "number" && option.amount >= 0
            ? option.amount
            : 0;

    return { ref, amount };
}

export function resolveCurrencyPick(
    grant: Grant,
    pickValue: string | undefined
): { ref: string; amount: number } | undefined {
    if (grant.grantType !== "currency" || grant.choose <= 0) {
        return undefined;
    }

    const optionIndex = parseOptionIndex(pickValue);
    if (optionIndex === undefined) {
        return undefined;
    }

    const option = grant.options?.[optionIndex];
    if (!option) {
        return undefined;
    }

    return resolveCurrencyOption(option);
}

export function isValidCurrencyPick(
    grant: Grant,
    pickValue: string
): boolean {
    if (grant.grantType !== "currency" || grant.choose <= 0) {
        return false;
    }

    return resolveCurrencyPick(grant, pickValue) !== undefined;
}

export function extractCurrencyGrants(grants: Grant[]): CurrencyGrantEntry[] {
    const entries: CurrencyGrantEntry[] = [];

    grants.forEach((grant, grantIndex) => {
        if (grant.grantType !== "currency" || grant.choose !== 0) {
            return;
        }

        const ref = coerceCurrencyRef(grant.ref);
        if (!ref) {
            return;
        }

        const amount =
            typeof grant.amount === "number" && grant.amount >= 0
                ? grant.amount
                : 0;

        entries.push({ ref, amount, grantIndex });
    });

    return entries;
}

export function collectCurrencyChoiceGrants(
    grants: Grant[],
    source: { type: string; id: string },
    featureLevel?: number
): CurrencyChoiceGrant[] {
    const results: CurrencyChoiceGrant[] = [];

    grants.forEach((grant, grantIndex) => {
        if (grant.grantType !== "currency" || grant.choose <= 0) {
            return;
        }

        const baseLabel = grant.description?.trim() || "Starting currency choice";

        for (let slot = 0; slot < grant.choose; slot++) {
            const label =
                grant.choose > 1
                    ? `${baseLabel} (${slot + 1}/${grant.choose})`
                    : baseLabel;

            results.push({
                key: buildCurrencyChoiceKey({
                    sourceType: source.type,
                    sourceId: source.id,
                    grantIndex,
                    slot,
                    featureLevel,
                }),
                grant,
                grantIndex,
                slot,
                label,
            });
        }
    });

    return results;
}

export function resolveCurrencyGrants(
    grants: Grant[],
    grantPicks: Record<string, string>,
    context: CurrencyGrantResolveContext
): CurrencyGrantEntry[] {
    const entries: CurrencyGrantEntry[] = [];

    grants.forEach((grant, grantIndex) => {
        if (grant.grantType !== "currency") {
            return;
        }

        if (grant.choose === 0) {
            const ref = coerceCurrencyRef(grant.ref);
            if (!ref) {
                return;
            }

            const amount =
                typeof grant.amount === "number" && grant.amount >= 0
                    ? grant.amount
                    : 0;

            entries.push({ ref, amount, grantIndex });
            return;
        }

        for (let slot = 0; slot < grant.choose; slot++) {
            const key = buildCurrencyChoiceKey({
                sourceType: context.sourceType,
                sourceId: context.sourceId,
                grantIndex,
                slot,
                featureLevel: context.featureLevel,
            });
            const resolved = resolveCurrencyPick(grant, grantPicks[key]);
            if (resolved) {
                entries.push({
                    ref: resolved.ref,
                    amount: resolved.amount,
                    grantIndex,
                });
            }
        }
    });

    return entries;
}

export function aggregateCurrencyByRef(
    entries: CurrencyGrantEntry[]
): Record<string, number> {
    const totals: Record<string, number> = {};

    for (const entry of entries) {
        totals[entry.ref] = (totals[entry.ref] ?? 0) + entry.amount;
    }

    return totals;
}
