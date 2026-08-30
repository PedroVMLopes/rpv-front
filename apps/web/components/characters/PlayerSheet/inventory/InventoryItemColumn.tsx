"use client";

import type { CharacterInventory } from "@rpv/domain";
import type { InventoryDisplayRow } from "@/lib/character/inventoryDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { InventoryItemContentCard } from "./InventoryItemContentCard";

type InventoryItemColumnProps = {
    heading: string;
    rows: InventoryDisplayRow[];
    stored: StoredCharacter;
    inventory: CharacterInventory;
    emptyLabel: string;
    testId: string;
};

export function InventoryItemColumn({
    heading,
    rows,
    stored,
    inventory,
    emptyLabel,
    testId,
}: InventoryItemColumnProps) {
    return (
        <section className="flex flex-col gap-3" data-testid={testId}>
            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">
                {heading}
            </h3>
            {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {rows.map((row) => (
                        <InventoryItemContentCard
                            key={row.key}
                            row={row}
                            stored={stored}
                            inventory={inventory}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
