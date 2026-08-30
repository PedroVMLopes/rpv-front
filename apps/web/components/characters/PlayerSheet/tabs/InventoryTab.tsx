"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { emptyInventory } from "@rpv/domain";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { sanitizeInventory } from "@/lib/character/inventory";
import {
    filterInventoryRows,
    listCarriedRows,
    listCosmeticPanelRows,
    listEquipmentColumnRows,
    type InventoryFilterId,
} from "@/lib/character/inventoryDisplay";
import { InventoryCosmeticPanel } from "../inventory/InventoryCosmeticPanel";
import { InventoryEquipmentPanel } from "../inventory/InventoryEquipmentPanel";
import { InventoryPossessionsPanel } from "../inventory/InventoryPossessionsPanel";
import { InventorySummaryRow } from "../inventory/InventorySummaryRow";

type InventoryTabProps = {
    stored: StoredCharacter;
};

export function InventoryTab({ stored }: InventoryTabProps) {
    const [activeFilter, setActiveFilter] = useState<InventoryFilterId>("all");

    const inventory = useMemo(
        () =>
            sanitizeInventory(
                stored.selections.inventory ?? emptyInventory(),
                stored.system,
                { reconcileEquipped: false }
            ),
        [stored.selections.inventory, stored.system]
    );

    const carriedRows = useMemo(
        () => listCarriedRows(inventory, stored.system),
        [inventory, stored.system]
    );

    const filteredCarriedRows = useMemo(
        () => filterInventoryRows(carriedRows, activeFilter, stored.system),
        [carriedRows, activeFilter, stored.system]
    );

    const hasAnyItems = useMemo(() => {
        const system = stored.system;
        return (
            carriedRows.length +
                listEquipmentColumnRows(inventory, system, "wearable").length +
                listEquipmentColumnRows(inventory, system, "usable").length +
                listCosmeticPanelRows(inventory, system).length >
            0
        );
    }, [carriedRows.length, inventory, stored.system]);

    return (
        <div className="flex flex-col gap-4">
            <InventorySummaryRow stored={stored} />
            <InventoryEquipmentPanel
                inventory={inventory}
                system={stored.system}
                stored={stored}
            />
            <InventoryPossessionsPanel
                rows={filteredCarriedRows}
                carriedRowCount={carriedRows.length}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                stored={stored}
                inventory={inventory}
                hasAnyItems={hasAnyItems}
            />
            <InventoryCosmeticPanel
                inventory={inventory}
                system={stored.system}
                stored={stored}
            />
        </div>
    );
}
