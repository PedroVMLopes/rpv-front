"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Shirt } from "lucide-react";
import { getEquipmentSlots, getItem } from "@rpv/content";
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
import { buildWeaponAttackRollRequest } from "@/lib/roll/buildRollRequest";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemContentCard } from "@/components/content/items/ItemContentCard";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";

type InventoryItemContentCardProps = {
    row: InventoryDisplayRow;
    stored: StoredCharacter;
    equipped: CharacterInventory["equipped"];
};

export function InventoryItemContentCard({
    row,
    stored,
    equipped,
}: InventoryItemContentCardProps) {
    const t = useTranslations("playerSheet.inventory");
    const tRoot = useTranslations();
    const tContentDetail = useTranslations("contentDetail");
    const tItems = useTranslations("items");
    const tSlots = useTranslations("equipmentSlots");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const equipItem = useCharacterStore((state) => state.equipItem);
    const unequipItem = useCharacterStore((state) => state.unequipItem);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const { openRollRequest } = useRollAssistant();

    const itemEntry = getItem(row.slug, stored.system, contentLocale);
    const slots = getEquipmentSlots(stored.system);
    const slugAlreadyEquipped = isSlugEquipped(equipped, row.slug);
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
        row.slotId,
        row.slug,
        stored,
    ]);

    const { summary, detail } = useMemo(() => {
        if (weaponAction) {
            const handLabel =
                weaponAction.slotId === "main-hand"
                    ? tSlots("mainHand")
                    : tSlots("offHand");
            const models = buildWeaponContentModel(
                {
                    weapon: weaponAction,
                    itemEntry: itemEntry ?? undefined,
                    slotLabel: handLabel,
                },
                weaponFormatters
            );
            return {
                summary: {
                    ...models.summary,
                    badges: [
                        { label: t("equippedBadge"), variant: "muted" as const },
                        ...models.summary.badges,
                    ],
                },
                detail: models.detail,
            };
        }

        const badges: Array<{ label: string; variant?: "default" | "muted" }> =
            [];
        if (row.equipped) {
            badges.push({ label: t("equippedBadge"), variant: "muted" });
        }
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
        const request = buildWeaponAttackRollRequest(weaponAction);
        if (request) {
            openRollRequest(request);
        }
    };

    const equipMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    className="size-6 cursor-pointer"
                    aria-label={t("equipActions")}
                >
                    <Shirt className="size-3.5" aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {row.equipped && row.slotId ? (
                    <DropdownMenuItem
                        onSelect={() => unequipItem(stored.id, row.slotId!)}
                    >
                        {t("unequip")}
                    </DropdownMenuItem>
                ) : (
                    slots.map((slot) => {
                        const canEquip =
                            !slugAlreadyEquipped &&
                            canEquipSlugToSlot(equipped, slot.id, row.slug);
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
                    })
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <ItemContentCard
            summary={summary}
            detail={detail}
            expandLabel={tContentDetail("expand", { title: summary.title })}
            onUse={summary.useAction ? handleUse : undefined}
            headerActions={equipMenu}
            data-testid={`inventory-card-${row.key}`}
        />
    );
}
