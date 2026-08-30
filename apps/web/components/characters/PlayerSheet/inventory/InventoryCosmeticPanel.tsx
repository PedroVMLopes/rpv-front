"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { CharacterInventory } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { listCosmeticPanelRows } from "@/lib/character/inventoryDisplay";
import { cn } from "@/lib/utils";
import { OverviewPanel } from "../overview/OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { InventoryItemGrid } from "./InventoryItemGrid";

type InventoryCosmeticPanelProps = {
    inventory: CharacterInventory;
    system: SystemKey;
    stored: StoredCharacter;
};

export function InventoryCosmeticPanel({
    inventory,
    system,
    stored,
}: InventoryCosmeticPanelProps) {
    const t = useTranslations("playerSheet.inventory");

    const rows = useMemo(
        () => listCosmeticPanelRows(inventory, system),
        [inventory, system]
    );

    return (
        <OverviewPanel title={t("cosmeticTitle")}>
            {rows.length === 0 ? (
                <p
                    className={cn(
                        "rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground",
                        sheetInset
                    )}
                    data-testid="inventory-cosmetic-empty"
                >
                    {t("cosmeticEmpty")}
                </p>
            ) : (
                <div data-testid="inventory-cosmetic">
                    <InventoryItemGrid
                        rows={rows}
                        stored={stored}
                        hasAnyItems={rows.length > 0}
                        inventory={inventory}
                    />
                </div>
            )}
        </OverviewPanel>
    );
}
