"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    getEquipmentSlots,
    getEquipableSlotIds,
    getItem,
    getSuggestedEquipmentSlotIds,
    isItemEquippable,
} from "@rpv/content";
import type { CharacterInventory } from "@rpv/domain";
import type { InventoryDisplayRow } from "@/lib/character/inventoryDisplay";
import {
    canEquipSlugToSlot,
    isInventorySlugEquippable,
    isSlugEquipped,
} from "@/lib/character/inventoryEquipActions";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";

type InventoryEquipMenuProps = {
    row: InventoryDisplayRow;
    stored: StoredCharacter;
    inventory: CharacterInventory;
    /** Slightly larger trigger for modal footer. */
    size?: "card" | "footer";
};

export function InventoryEquipMenu({
    row,
    stored,
    inventory,
    size = "card",
}: InventoryEquipMenuProps) {
    const t = useTranslations("playerSheet.inventory");
    const tRoot = useTranslations();
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const equipItem = useCharacterStore((state) => state.equipItem);
    const unequipItem = useCharacterStore((state) => state.unequipItem);
    const unequipItemFromMultiSlot = useCharacterStore(
        (state) => state.unequipItemFromMultiSlot
    );

    const itemEntry = getItem(row.slug, stored.system, contentLocale);
    const slots = getEquipmentSlots(stored.system);
    const equipped = inventory.equipped;
    const equippedMulti = inventory.equippedMulti ?? {};
    const slugAlreadyEquipped = isSlugEquipped(
        equipped,
        row.slug,
        equippedMulti
    );

    const eligibleSlots = useMemo(() => {
        if (!itemEntry) {
            return [];
        }

        const allowedIds = new Set(getEquipableSlotIds(itemEntry, stored.system));
        return slots.filter((slot) => allowedIds.has(slot.id));
    }, [itemEntry, slots, stored.system]);

    const orderedSlots = useMemo(() => {
        if (!itemEntry) {
            return { suggested: [], rest: [] };
        }

        const suggestedIds = getSuggestedEquipmentSlotIds(itemEntry);
        const suggested = eligibleSlots.filter((slot) =>
            suggestedIds.includes(slot.id)
        );
        const rest = eligibleSlots.filter((slot) => !suggestedIds.includes(slot.id));
        return { suggested, rest };
    }, [eligibleSlots, itemEntry]);

    if (
        !row.equipped &&
        (itemEntry
            ? !isItemEquippable(itemEntry)
            : !isInventorySlugEquippable(row.slug, stored.system))
    ) {
        return null;
    }

    if (!row.equipped && eligibleSlots.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant={row.equipped ? "link" : "ghost"}
                    size="sm"
                    className={
                        size === "footer"
                            ? "h-9 shrink-0 px-3 text-sm font-semibold"
                            : "h-6 shrink-0 px-1.5 text-xs font-semibold"
                    }
                    aria-label={
                        row.equipped ? t("equippedBadge") : t("equip")
                    }
                >
                    {row.equipped ? t("equippedBadge") : t("equip")}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                {row.equipped && row.slotId ? (
                    <DropdownMenuItem
                        onSelect={() => {
                            if (row.multiEquipped) {
                                unequipItemFromMultiSlot(
                                    stored.id,
                                    row.slotId!,
                                    row.slug
                                );
                            } else {
                                unequipItem(stored.id, row.slotId!);
                            }
                        }}
                    >
                        {t("unequip")}
                    </DropdownMenuItem>
                ) : (
                    <>
                        {orderedSlots.suggested.length > 0 ? (
                            <>
                                <DropdownMenuLabel>
                                    {t("suggestedSlots")}
                                </DropdownMenuLabel>
                                {orderedSlots.suggested.map((slot) => {
                                    const canEquip =
                                        !slugAlreadyEquipped &&
                                        canEquipSlugToSlot(
                                            equipped,
                                            slot.id,
                                            row.slug,
                                            equippedMulti,
                                            stored.system
                                        );
                                    const label = tRoot(slot.labelKey);
                                    return (
                                        <DropdownMenuItem
                                            key={slot.id}
                                            disabled={!canEquip}
                                            onSelect={() =>
                                                equipItem(
                                                    stored.id,
                                                    slot.id,
                                                    row.slug
                                                )
                                            }
                                        >
                                            {t("equipToSlot", { slot: label })}
                                        </DropdownMenuItem>
                                    );
                                })}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>
                                    {t("otherSlots")}
                                </DropdownMenuLabel>
                            </>
                        ) : null}
                        {(orderedSlots.suggested.length > 0
                            ? orderedSlots.rest
                            : eligibleSlots
                        ).map((slot) => {
                            const canEquip =
                                !slugAlreadyEquipped &&
                                canEquipSlugToSlot(
                                    equipped,
                                    slot.id,
                                    row.slug,
                                    equippedMulti,
                                    stored.system
                                );
                            const label = tRoot(slot.labelKey);
                            return (
                                <DropdownMenuItem
                                    key={slot.id}
                                    disabled={!canEquip}
                                    onSelect={() =>
                                        equipItem(stored.id, slot.id, row.slug)
                                    }
                                >
                                    {t("equipToSlot", { slot: label })}
                                </DropdownMenuItem>
                            );
                        })}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
