"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { CharacterInventory } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { listEquippedRowsByGroup } from "@/lib/character/inventoryDisplay";
import { cn } from "@/lib/utils";
import { OverviewPanel } from "../overview/OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { InventoryItemCard } from "./InventoryItemCard";

type InventoryEquippedPanelProps = {
    inventory: CharacterInventory;
    system: SystemKey;
    characterId: string;
};

function EquippedColumn({
    heading,
    rows,
    system,
    characterId,
    equipped,
    emptyLabel,
    testId,
}: {
    heading: string;
    rows: ReturnType<typeof listEquippedRowsByGroup>;
    system: SystemKey;
    characterId: string;
    equipped: CharacterInventory["equipped"];
    emptyLabel: string;
    testId: string;
}) {
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
                        <InventoryItemCard
                            key={row.key}
                            row={row}
                            system={system}
                            characterId={characterId}
                            equipped={equipped}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export function InventoryEquippedPanel({
    inventory,
    system,
    characterId,
}: InventoryEquippedPanelProps) {
    const t = useTranslations("playerSheet.inventory");

    const wearableRows = useMemo(
        () => listEquippedRowsByGroup(inventory, system, "wearable"),
        [inventory, system]
    );
    const usableRows = useMemo(
        () => listEquippedRowsByGroup(inventory, system, "usable"),
        [inventory, system]
    );

    const isEmpty = wearableRows.length === 0 && usableRows.length === 0;

    return (
        <OverviewPanel title={t("equippedTitle")}>
            {isEmpty ? (
                <p
                    className={cn(
                        "rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground",
                        sheetInset
                    )}
                    data-testid="inventory-equipped-empty"
                >
                    {t("equippedEmpty")}
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <EquippedColumn
                        heading={t("equippedWearableHeading")}
                        rows={wearableRows}
                        system={system}
                        characterId={characterId}
                        equipped={inventory.equipped}
                        emptyLabel={t("equippedColumnEmpty")}
                        testId="inventory-equipped-wearable"
                    />
                    <EquippedColumn
                        heading={t("equippedUsableHeading")}
                        rows={usableRows}
                        system={system}
                        characterId={characterId}
                        equipped={inventory.equipped}
                        emptyLabel={t("equippedColumnEmpty")}
                        testId="inventory-equipped-usable"
                    />
                </div>
            )}
        </OverviewPanel>
    );
}
