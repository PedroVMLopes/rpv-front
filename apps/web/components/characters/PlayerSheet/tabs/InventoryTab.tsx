"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { emptyInventory } from "@rpv/domain";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { sanitizeInventory } from "@/lib/character/inventory";
import {
    filterInventoryRows,
    listInventoryRows,
    type InventoryFilterId,
} from "@/lib/character/inventoryDisplay";
import { InventoryEquippedPanel } from "../inventory/InventoryEquippedPanel";
import { InventorySummaryRow } from "../inventory/InventorySummaryRow";
import { InventoryToolbar } from "../inventory/InventoryToolbar";
import { InventoryItemGrid } from "../inventory/InventoryItemGrid";
import { OverviewPanel } from "../overview/OverviewPanel";

type InventoryTabProps = {
    stored: StoredCharacter;
};

export function InventoryTab({ stored }: InventoryTabProps) {
    const t = useTranslations("playerSheet.inventory");
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

    const allRows = useMemo(
        () => listInventoryRows(inventory, stored.system),
        [inventory, stored.system]
    );

    const filteredRows = useMemo(
        () => filterInventoryRows(allRows, activeFilter, stored.system),
        [allRows, activeFilter, stored.system]
    );

    const hasAnyItems = allRows.length > 0;

    return (
        <div className="flex flex-col gap-4">
            <InventorySummaryRow stored={stored} />
            <InventoryEquippedPanel
                inventory={inventory}
                system={stored.system}
                stored={stored}
            />
            <OverviewPanel title={t("itemsTitle")}>
                <div className="flex flex-col gap-4">
                    <InventoryToolbar
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />
                    <InventoryItemGrid
                        rows={filteredRows}
                        stored={stored}
                        hasAnyItems={hasAnyItems}
                        inventory={inventory}
                    />
                </div>
            </OverviewPanel>
        </div>
    );
}
