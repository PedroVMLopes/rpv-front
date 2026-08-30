"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { CharacterInventory } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { listEquipmentColumnRows } from "@/lib/character/inventoryDisplay";
import { cn } from "@/lib/utils";
import { OverviewPanel } from "../overview/OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { InventoryItemColumn } from "./InventoryItemColumn";

type InventoryEquipmentPanelProps = {
    inventory: CharacterInventory;
    system: SystemKey;
    stored: StoredCharacter;
};

export function InventoryEquipmentPanel({
    inventory,
    system,
    stored,
}: InventoryEquipmentPanelProps) {
    const t = useTranslations("playerSheet.inventory");

    const wearableRows = useMemo(
        () => listEquipmentColumnRows(inventory, system, "wearable"),
        [inventory, system]
    );
    const usableRows = useMemo(
        () => listEquipmentColumnRows(inventory, system, "usable"),
        [inventory, system]
    );

    const isEmpty = wearableRows.length === 0 && usableRows.length === 0;

    return (
        <OverviewPanel title={t("equipmentTitle")}>
            {isEmpty ? (
                <p
                    className={cn(
                        "rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground",
                        sheetInset
                    )}
                    data-testid="inventory-equipment-empty"
                >
                    {t("equippedEmpty")}
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InventoryItemColumn
                        heading={t("equippedWearableHeading")}
                        rows={wearableRows}
                        stored={stored}
                        inventory={inventory}
                        emptyLabel={t("equippedColumnEmpty")}
                        testId="inventory-equipment-wearable"
                    />
                    <InventoryItemColumn
                        heading={t("equippedUsableHeading")}
                        rows={usableRows}
                        stored={stored}
                        inventory={inventory}
                        emptyLabel={t("equippedColumnEmpty")}
                        testId="inventory-equipment-usable"
                    />
                </div>
            )}
        </OverviewPanel>
    );
}
