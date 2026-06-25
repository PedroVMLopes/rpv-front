import type { Grant } from "./grant.types";

export type CurrencyGrantEntry = {
    ref: string;
    amount: number;
    grantIndex: number;
};

function coerceCurrencyRef(ref: unknown): string | undefined {
    if (typeof ref !== "string") {
        return undefined;
    }

    const normalized = ref.trim().toLowerCase();
    return normalized.length > 0 ? normalized : undefined;
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

export function currencyGrantProvenance(
    sourceType: string,
    sourceId: string,
    grantIndex: number
): string {
    return `grant:${sourceType}:${sourceId}:${grantIndex}`;
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
