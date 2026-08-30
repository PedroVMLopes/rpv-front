"use client";

import type { CharacterInventory } from "@rpv/domain";
import { useTranslations } from "next-intl";
import type {
    InventoryDisplayRow,
    InventoryFilterId,
} from "@/lib/character/inventoryDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { OverviewPanel } from "../overview/OverviewPanel";
import { InventoryItemGrid } from "./InventoryItemGrid";
import { InventoryToolbar } from "./InventoryToolbar";

type InventoryPossessionsPanelProps = {
    rows: InventoryDisplayRow[];
    carriedRowCount: number;
    activeFilter: InventoryFilterId;
    onFilterChange: (filter: InventoryFilterId) => void;
    stored: StoredCharacter;
    inventory: CharacterInventory;
};

export function InventoryPossessionsPanel({
    rows,
    carriedRowCount,
    activeFilter,
    onFilterChange,
    stored,
    inventory,
}: InventoryPossessionsPanelProps) {
    const t = useTranslations("playerSheet.inventory");

    return (
        <OverviewPanel title={t("possessionsTitle")}>
            <div className="flex flex-col gap-4">
                <InventoryToolbar
                    activeFilter={activeFilter}
                    onFilterChange={onFilterChange}
                />
                <InventoryItemGrid
                    rows={rows}
                    stored={stored}
                    hasAnyItems={carriedRowCount > 0}
                    inventory={inventory}
                />
            </div>
        </OverviewPanel>
    );
}
