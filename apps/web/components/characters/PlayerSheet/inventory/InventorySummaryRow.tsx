"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FaBox, FaCoins, FaWeightHanging } from "react-icons/fa6";
import { countMiscItems } from "@/lib/character/inventoryDisplay";
import { getTotalCurrency } from "@/lib/character/materializeCurrencyGrants";
import type { StoredCharacter } from "@/lib/character/storedCharacter";

type InventorySummaryRowProps = {
    stored: StoredCharacter;
};

const CURRENCY_REFS = ["gold", "silver", "bronze"] as const;

function formatCurrencyParts(currency: Record<string, number>): string[] {
    return CURRENCY_REFS.filter((ref) => (currency[ref] ?? 0) > 0).map(
        (ref) => `${currency[ref]} ${ref}`
    );
}

export function InventorySummaryRow({ stored }: InventorySummaryRowProps) {
    const t = useTranslations("playerSheet.inventory");

    const currency = useMemo(() => getTotalCurrency(stored), [stored]);
    const currencyParts = formatCurrencyParts(currency);
    const miscCount = countMiscItems(
        stored.selections.inventory?.bag ?? [],
        stored.system
    );

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <section className="flex flex-col gap-2 rounded-2xl border bg-popover p-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                        {t("summary.encumbrance")}
                    </h2>
                    <FaWeightHanging
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />
                </div>
                <p className="text-lg font-bold tabular-nums">— / —</p>
                <div
                    className="h-2 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t("summary.encumbrance")}
                >
                    <div className="h-full w-0 rounded-full bg-primary" />
                </div>
            </section>

            <section className="flex flex-col gap-2 rounded-2xl border bg-popover p-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                        {t("summary.currency")}
                    </h2>
                    <FaCoins
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />
                </div>
                {currencyParts.length > 0 ? (
                    <ul className="flex flex-col gap-1 text-sm font-semibold">
                        {currencyParts.map((part) => (
                            <li key={part}>{part}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                )}
            </section>

            <section className="flex flex-col gap-2 rounded-2xl border bg-popover p-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                        {t("summary.miscItems")}
                    </h2>
                    <FaBox
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />
                </div>
                <p className="text-3xl font-bold tabular-nums">{miscCount}</p>
            </section>
        </div>
    );
}
