"use client";

import { useMemo, useState } from "react";
import { emptyInventory } from "@rpv/domain";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { sanitizeInventory } from "@/lib/character/inventory";
import {
    filterInventoryRows,
    filterInventoryRowsByQuery,
    listCarriedRows,
    type InventoryFilterId,
} from "@/lib/character/inventoryDisplay";
import { useContentLocale } from "@/store/useContentLocale";
import { InventoryAddItemModal } from "../inventory/InventoryAddItemModal";
import { InventoryCosmeticPanel } from "../inventory/InventoryCosmeticPanel";
import { InventoryEquipmentPanel } from "../inventory/InventoryEquipmentPanel";
import { InventoryPossessionsPanel } from "../inventory/InventoryPossessionsPanel";
import { InventorySummaryRow } from "../inventory/InventorySummaryRow";

type InventoryTabProps = {
    stored: StoredCharacter;
};

export function InventoryTab({ stored }: InventoryTabProps) {
    const [activeFilter, setActiveFilter] = useState<InventoryFilterId>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [addItemOpen, setAddItemOpen] = useState(false);
    const contentLocale = useContentLocale((state) => state.contentLocale);

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

    const filteredCarriedRows = useMemo(() => {
        const byCategory = filterInventoryRows(
            carriedRows,
            activeFilter,
            stored.system
        );
        return filterInventoryRowsByQuery(
            byCategory,
            searchQuery,
            stored.system
        );
    }, [carriedRows, activeFilter, searchQuery, stored.system]);

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
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddItem={() => setAddItemOpen(true)}
                stored={stored}
                inventory={inventory}
            />
            <InventoryCosmeticPanel
                inventory={inventory}
                system={stored.system}
                stored={stored}
            />
            <InventoryAddItemModal
                open={addItemOpen}
                onOpenChange={setAddItemOpen}
                system={stored.system}
                characterId={stored.id}
                locale={contentLocale}
            />
        </div>
    );
}
