"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    getEquipmentSlots,
    getItem,
    getSuggestedEquipmentSlotIds,
    isItemStackable,
} from "@rpv/content";
import type { CharacterInventory } from "@rpv/domain";
import {
    buildWeaponActionForEquippedSlot,
    isWeaponSlotId,
} from "@/lib/character/combatActions";
import {
    formatInventoryItemTitle,
    type InventoryDisplayRow,
} from "@/lib/character/inventoryDisplay";
import {
    canEquipSlugToSlot,
    isSlugEquipped,
} from "@/lib/character/inventoryEquipActions";
import {
    buildItemContentModel,
    type ItemContentFormatters,
} from "@/lib/content/buildItemContentModel";
import {
    buildWeaponContentModel,
    type WeaponContentFormatters,
} from "@/lib/content/buildWeaponContentModel";
import type { ContentUseActionSpec } from "@/lib/content/contentDetail.types";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    buildWeaponAttackOnlyRollRequest,
    buildWeaponDamageRollRequest,
} from "@/lib/roll/buildRollRequest";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContentActionCard } from "@/components/content/ContentActionCard";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";

type InventoryItemContentCardProps = {
    row: InventoryDisplayRow;
    stored: StoredCharacter;
    inventory: CharacterInventory;
};

export function InventoryItemContentCard({
    row,
    stored,
    inventory,
}: InventoryItemContentCardProps) {
    const t = useTranslations("playerSheet.inventory");
    const tRoot = useTranslations();
    const tContentDetail = useTranslations("contentDetail");
    const tItems = useTranslations("items");
    const tSlots = useTranslations("equipmentSlots");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const equipItem = useCharacterStore((state) => state.equipItem);
    const unequipItem = useCharacterStore((state) => state.unequipItem);
    const unequipItemFromMultiSlot = useCharacterStore(
        (state) => state.unequipItemFromMultiSlot
    );
    const setBagQuantity = useCharacterStore((state) => state.setBagQuantity);
    const deleteInventoryItem = useCharacterStore(
        (state) => state.deleteInventoryItem
    );
    const unequipItemToBag = useCharacterStore(
        (state) => state.unequipItemToBag
    );
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const { openRollRequest } = useRollAssistant();

    const itemEntry = getItem(row.slug, stored.system, contentLocale);
    const slots = getEquipmentSlots(stored.system);
    const equipped = inventory.equipped;
    const equippedMulti = inventory.equippedMulti ?? {};
    const slugAlreadyEquipped = isSlugEquipped(
        equipped,
        row.slug,
        equippedMulti
    );
    const resolved = getResolvedStats(stored.id);
    const displayQuantity = row.quantity;
    const stackable = itemEntry ? isItemStackable(itemEntry) : true;

    const itemFormatters = useMemo<ItemContentFormatters>(
        () => ({ missingValue: "—" }),
        []
    );
    const weaponFormatters = useMemo<WeaponContentFormatters>(
        () => ({
            tItems: (key, values) => tItems(key, values),
            missingValue: "—",
        }),
        [tItems]
    );

    const slotLabel = useMemo(() => {
        if (!row.slotId) {
            return undefined;
        }
        const slot = slots.find((entry) => entry.id === row.slotId);
        return slot ? tRoot(slot.labelKey) : row.slotId;
    }, [row.slotId, slots, tRoot]);

    const weaponAction = useMemo(() => {
        if (
            !row.equipped ||
            row.multiEquipped ||
            !row.slotId ||
            !isWeaponSlotId(row.slotId) ||
            !resolved ||
            !itemEntry?.weapon
        ) {
            return null;
        }

        return buildWeaponActionForEquippedSlot(
            stored,
            resolved,
            row.slotId,
            row.slug,
            contentLocale
        );
    }, [
        contentLocale,
        itemEntry?.weapon,
        resolved,
        row.equipped,
        row.multiEquipped,
        row.slotId,
        row.slug,
        stored,
    ]);

    const { summary, detail } = useMemo(() => {
        const titled = (name: string) =>
            formatInventoryItemTitle(name, displayQuantity);

        if (weaponAction) {
            const handLabel =
                weaponAction.slotId === "melee-main"
                    ? tSlots("meleeMain")
                    : weaponAction.slotId === "melee-off"
                      ? tSlots("meleeOff")
                      : weaponAction.slotId === "ranged-main"
                        ? tSlots("rangedMain")
                        : tSlots("rangedOff");
            const models = buildWeaponContentModel(
                {
                    weapon: weaponAction,
                    itemEntry: itemEntry ?? undefined,
                    slotLabel: handLabel,
                },
                weaponFormatters
            );
            const title = titled(models.summary.title);
            const quantityRow = {
                labelKey: "quantity",
                value: String(displayQuantity),
                quantityControls: true as const,
            };
            const detailRows = [
                ...(models.detail.sections[0]?.rows ?? []),
                quantityRow,
            ];
            return {
                summary: { ...models.summary, title },
                detail: {
                    ...models.detail,
                    title,
                    sections: [{ rows: detailRows }],
                },
            };
        }

        const badges: Array<{ label: string; variant?: "default" | "muted" }> =
            [];
        if (slotLabel) {
            badges.push({ label: slotLabel, variant: "muted" });
        } else if (itemEntry?.category?.name) {
            badges.push({
                label: itemEntry.category.name,
                variant: "muted",
            });
        }

        const models = buildItemContentModel(
            {
                id: row.key,
                itemEntry,
                fallbackTitle: row.slug,
                badges,
                quantity: displayQuantity,
            },
            itemFormatters
        );
        const title = titled(models.summary.title);
        return {
            summary: { ...models.summary, title },
            detail: { ...models.detail, title },
        };
    }, [
        displayQuantity,
        itemEntry,
        itemFormatters,
        row.key,
        row.slug,
        slotLabel,
        tSlots,
        weaponAction,
        weaponFormatters,
    ]);

    const handleUse = (useAction: ContentUseActionSpec) => {
        if (useAction.kind !== "roll" || !weaponAction) {
            return;
        }

        if (useAction.role === "damage") {
            const request = buildWeaponDamageRollRequest(weaponAction);
            if (request) {
                openRollRequest(request);
            }
            return;
        }

        const request = buildWeaponAttackOnlyRollRequest(weaponAction);
        if (request) {
            openRollRequest(request);
        }
    };

    const handleAdjustQuantity = (delta: -1 | 1) => {
        if (row.equipped && row.slotId) {
            if (delta === -1) {
                unequipItemToBag(
                    stored.id,
                    row.slotId,
                    0,
                    row.multiEquipped ? row.slug : undefined
                );
            }
            return;
        }

        const next = Math.max(0, displayQuantity + delta);
        if (!stackable && next > 1) {
            return;
        }
        setBagQuantity(stored.id, row.slug, next);
    };

    const handleDelete = () => {
        if (row.equipped && row.slotId) {
            deleteInventoryItem(stored.id, {
                slug: row.slug,
                slotId: row.slotId,
                multiEquipped: row.multiEquipped,
            });
            return;
        }
        deleteInventoryItem(stored.id, { slug: row.slug });
    };

    const orderedSlots = useMemo(() => {
        const suggestedIds = itemEntry
            ? getSuggestedEquipmentSlotIds(itemEntry)
            : [];
        const suggested = slots.filter((slot) => suggestedIds.includes(slot.id));
        const rest = slots.filter((slot) => !suggestedIds.includes(slot.id));
        return { suggested, rest };
    }, [itemEntry, slots]);

    const equipMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant={row.equipped ? "ghost" : "outline"}
                    size="sm"
                    className="h-6 shrink-0 px-1.5 text-xs font-semibold"
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
                            : slots
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

    return (
        <ContentActionCard
            summary={summary}
            detail={detail}
            expandLabel={tContentDetail("expand", { title: summary.title })}
            onUse={
                summary.useActions?.length || summary.useAction
                    ? handleUse
                    : undefined
            }
            headerActions={equipMenu}
            quantityHandlers={{
                onAdjustQuantity: handleAdjustQuantity,
                canDecrementQuantity: true,
                canIncrementQuantity: row.equipped
                    ? false
                    : stackable || displayQuantity < 1,
                decreaseLabel: t("decreaseQuantity"),
                increaseLabel: t("increaseQuantity"),
            }}
            onDelete={handleDelete}
            deleteLabel={t("deleteItem")}
            data-testid={`inventory-card-${row.key}`}
        />
    );
}
