"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { getEquipmentSlots, getItem, isItemStackable, isItemEquippable } from "@rpv/content";
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
    buildItemContentModel,
    type ItemContentFormatters,
} from "@/lib/content/buildItemContentModel";
import {
    buildWeaponContentModel,
    type WeaponContentFormatters,
} from "@/lib/content/buildWeaponContentModel";
import type { ContentUseActionSpec } from "@/lib/content/contentDetail.types";
import { itemLacksArmorProficiency } from "@/lib/character/armorProficiencyWarning";
import { isInventorySlugEquippable } from "@/lib/character/inventoryEquipActions";
import {
    buildWeaponAttackOnlyRollRequest,
    buildWeaponDamageRollRequest,
} from "@/lib/roll/buildRollRequest";
import { ContentActionCard } from "@/components/content/ContentActionCard";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { InventoryEquipMenu } from "./InventoryEquipMenu";

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
    const tCombat = useTranslations("playerSheet.combat");
    const tContentDetail = useTranslations("contentDetail");
    const tItems = useTranslations("items");
    const tSlots = useTranslations("equipmentSlots");
    const contentLocale = useContentLocale((state) => state.contentLocale);
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
    const resolved = getResolvedStats(stored.id);
    const bagQuantity = inventory.bag
        .filter((stack) => stack.slug === row.slug)
        .reduce((total, stack) => total + stack.quantity, 0);
    const equippedCount =
        Object.values(inventory.equipped).filter((slug) => slug === row.slug)
            .length +
        Object.values(inventory.equippedMulti ?? {}).reduce(
            (total, slugs) =>
                total + slugs.filter((slug) => slug === row.slug).length,
            0
        );
    // Equipped rows are stored as qty 1 per slot; show owned total (bag + equipped).
    const displayQuantity = row.equipped
        ? bagQuantity + equippedCount
        : row.quantity;
    const stackable = itemEntry ? isItemStackable(itemEntry) : true;
    const showEquipMenu =
        row.equipped ||
        (itemEntry
            ? isItemEquippable(itemEntry)
            : isInventorySlugEquippable(row.slug, stored.system));

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
        const slot = getEquipmentSlots(stored.system).find(
            (entry) => entry.id === row.slotId
        );
        return slot ? tRoot(slot.labelKey) : row.slotId;
    }, [row.slotId, stored.system, tRoot]);

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

    const lacksArmorProficiency = Boolean(
        row.equipped &&
            itemEntry &&
            itemLacksArmorProficiency(itemEntry, stored.grants ?? [])
    );

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
            const badges = lacksArmorProficiency
                ? [
                      ...models.summary.badges,
                      { label: tCombat("armorNotProficient") },
                  ]
                : models.summary.badges;
            return {
                summary: { ...models.summary, title, badges },
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
        if (lacksArmorProficiency) {
            badges.push({ label: tCombat("armorNotProficient") });
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
        lacksArmorProficiency,
        tCombat,
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
        const nextOwned = Math.max(0, displayQuantity + delta);
        if (!stackable && nextOwned > 1) {
            return;
        }

        if (row.equipped && row.slotId && nextOwned < equippedCount) {
            unequipItemToBag(
                stored.id,
                row.slotId,
                nextOwned,
                row.multiEquipped ? row.slug : undefined
            );
            return;
        }

        const nextBag = row.equipped
            ? Math.max(0, nextOwned - equippedCount)
            : nextOwned;
        setBagQuantity(stored.id, row.slug, nextBag);
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

    const equipMenuCard = showEquipMenu ? (
        <InventoryEquipMenu
            row={row}
            stored={stored}
            inventory={inventory}
            size="card"
        />
    ) : undefined;
    const equipMenuFooter = showEquipMenu ? (
        <InventoryEquipMenu
            row={row}
            stored={stored}
            inventory={inventory}
            size="footer"
        />
    ) : undefined;

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
            headerActions={equipMenuCard}
            quantityHandlers={{
                onAdjustQuantity: handleAdjustQuantity,
                canDecrementQuantity: displayQuantity > 0,
                canIncrementQuantity: stackable || displayQuantity < 1,
                decreaseLabel: t("decreaseQuantity"),
                increaseLabel: t("increaseQuantity"),
            }}
            onDelete={handleDelete}
            deleteLabel={t("deleteItem")}
            equipActions={equipMenuFooter}
            data-testid={`inventory-card-${row.key}`}
        />
    );
}
