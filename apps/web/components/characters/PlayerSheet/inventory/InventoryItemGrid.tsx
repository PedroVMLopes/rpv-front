"use client";

import { useTranslations } from "next-intl";
import type { CharacterInventory } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import type { InventoryDisplayRow } from "@/lib/character/inventoryDisplay";
import { cn } from "@/lib/utils";
import { InventoryItemCard } from "./InventoryItemCard";
import { sheetInset } from "../playerSheetSurfaces";

type InventoryItemGridProps = {
    rows: InventoryDisplayRow[];
    system: SystemKey;
    hasAnyItems: boolean;
    characterId: string;
    equipped: CharacterInventory["equipped"];
};

export function InventoryItemGrid({
    rows,
    system,
    hasAnyItems,
    characterId,
    equipped,
}: InventoryItemGridProps) {
    const t = useTranslations("playerSheet.inventory");

    if (rows.length === 0) {
        return (
            <p
                className={cn(
                    "rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground",
                    sheetInset
                )}
            >
                {hasAnyItems ? t("emptyFiltered") : t("empty")}
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rows.map((row) => (
                <InventoryItemCard
                    key={row.key}
                    row={row}
                    system={system}
                    characterId={characterId}
                    equipped={equipped}
                />
            ))}
        </div>
    );
}
