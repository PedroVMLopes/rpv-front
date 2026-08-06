"use client";

import { useTranslations } from "next-intl";
import type { CharacterInventory } from "@rpv/domain";
import type { InventoryDisplayRow } from "@/lib/character/inventoryDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { cn } from "@/lib/utils";
import { InventoryItemContentCard } from "./InventoryItemContentCard";
import { sheetInset } from "../playerSheetSurfaces";

type InventoryItemGridProps = {
    rows: InventoryDisplayRow[];
    stored: StoredCharacter;
    hasAnyItems: boolean;
    inventory: CharacterInventory;
};

export function InventoryItemGrid({
    rows,
    stored,
    hasAnyItems,
    inventory,
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
                <InventoryItemContentCard
                    key={row.key}
                    row={row}
                    stored={stored}
                    inventory={inventory}
                />
            ))}
        </div>
    );
}
