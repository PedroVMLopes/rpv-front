"use client";

import { useTranslations } from "next-intl";
import type { SystemKey } from "@/presets";
import type { InventoryDisplayRow } from "@/lib/character/inventoryDisplay";
import { InventoryItemCard } from "./InventoryItemCard";

type InventoryItemGridProps = {
    rows: InventoryDisplayRow[];
    system: SystemKey;
    hasAnyItems: boolean;
};

export function InventoryItemGrid({
    rows,
    system,
    hasAnyItems,
}: InventoryItemGridProps) {
    const t = useTranslations("playerSheet.inventory");

    if (rows.length === 0) {
        return (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {hasAnyItems ? t("emptyFiltered") : t("empty")}
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rows.map((row) => (
                <InventoryItemCard key={row.key} row={row} system={system} />
            ))}
        </div>
    );
}
