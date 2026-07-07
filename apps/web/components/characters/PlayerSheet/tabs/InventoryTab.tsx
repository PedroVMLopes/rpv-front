"use client";

import { useMemo, useState } from "react";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    filterInventoryRows,
    listInventoryRows,
    type InventoryFilterId,
} from "@/lib/character/inventoryDisplay";
import { InventorySummaryRow } from "../inventory/InventorySummaryRow";
import { InventoryToolbar } from "../inventory/InventoryToolbar";
import { InventoryItemGrid } from "../inventory/InventoryItemGrid";

type InventoryTabProps = {
    stored: StoredCharacter;
};

export function InventoryTab({ stored }: InventoryTabProps) {
    const [activeFilter, setActiveFilter] = useState<InventoryFilterId>("all");

    const inventory = stored.selections.inventory ?? { bag: [], equipped: {} };

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
            <InventoryToolbar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <InventoryItemGrid
                rows={filteredRows}
                system={stored.system}
                hasAnyItems={hasAnyItems}
            />
        </div>
    );
}
