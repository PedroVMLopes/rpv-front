"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { CharacterInventory } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { listEquippedRowsByGroup } from "@/lib/character/inventoryDisplay";
import { cn } from "@/lib/utils";
import { OverviewPanel } from "../overview/OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { InventoryItemContentCard } from "./InventoryItemContentCard";

type InventoryEquippedPanelProps = {
    inventory: CharacterInventory;
    system: SystemKey;
    stored: StoredCharacter;
};

function EquippedColumn({
    heading,
    rows,
    stored,
    inventory,
    emptyLabel,
    testId,
}: {
    heading: string;
    rows: ReturnType<typeof listEquippedRowsByGroup>;
    stored: StoredCharacter;
    inventory: CharacterInventory;
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

export function InventoryEquippedPanel({
    inventory,
    system,
    stored,
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
    const cosmeticRows = useMemo(
        () => listEquippedRowsByGroup(inventory, system, "cosmetic"),
        [inventory, system]
    );

    const isEmpty =
        wearableRows.length === 0 &&
        usableRows.length === 0 &&
        cosmeticRows.length === 0;

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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <EquippedColumn
                        heading={t("equippedWearableHeading")}
                        rows={wearableRows}
                        stored={stored}
                        inventory={inventory}
                        emptyLabel={t("equippedColumnEmpty")}
                        testId="inventory-equipped-wearable"
                    />
                    <EquippedColumn
                        heading={t("equippedUsableHeading")}
                        rows={usableRows}
                        stored={stored}
                        inventory={inventory}
                        emptyLabel={t("equippedColumnEmpty")}
                        testId="inventory-equipped-usable"
                    />
                    <EquippedColumn
                        heading={t("equippedCosmeticHeading")}
                        rows={cosmeticRows}
                        stored={stored}
                        inventory={inventory}
                        emptyLabel={t("equippedColumnEmpty")}
                        testId="inventory-equipped-cosmetic"
                    />
                </div>
            )}
        </OverviewPanel>
    );
}
