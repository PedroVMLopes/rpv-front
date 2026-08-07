"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    getEquipmentSlots,
    getItem,
    getSuggestedEquipmentSlotIds,
} from "@rpv/content";
import type { CharacterInventory } from "@rpv/domain";
import {
    buildWeaponActionForEquippedSlot,
    isWeaponSlotId,
} from "@/lib/character/combatActions";
import type { InventoryDisplayRow } from "@/lib/character/inventoryDisplay";
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
            return {
                summary: models.summary,
                detail: models.detail,
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

        return buildItemContentModel(
            {
                id: row.key,
                itemEntry,
                fallbackTitle: row.slug,
                badges,
                quantity: row.equipped ? undefined : row.quantity,
            },
            itemFormatters
        );
    }, [
        itemEntry,
        itemFormatters,
        row.equipped,
        row.key,
        row.quantity,
        row.slug,
        slotLabel,
        t,
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
                    variant="ghost"
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
            data-testid={`inventory-card-${row.key}`}
        />
    );
}
