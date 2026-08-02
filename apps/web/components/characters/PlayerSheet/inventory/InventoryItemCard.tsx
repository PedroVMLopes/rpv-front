"use client";

import { useTranslations } from "next-intl";
import { FaEllipsisVertical, FaMinus, FaPlus } from "react-icons/fa6";
import {
    FaBox,
    FaBottleWater,
    FaHammer,
    FaKhanda,
    FaShieldHalved,
} from "react-icons/fa6";
import { getEquipmentSlots, getItem } from "@rpv/content";
import type { CharacterInventory } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InventoryDisplayRow } from "@/lib/character/inventoryDisplay";
import {
    canEquipSlugToSlot,
    isSlugEquipped,
} from "@/lib/character/inventoryEquipActions";
import { cn } from "@/lib/utils";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { sheetInset } from "../playerSheetSurfaces";

type InventoryItemCardProps = {
    row: InventoryDisplayRow;
    system: SystemKey;
    characterId: string;
    equipped: CharacterInventory["equipped"];
};

function categoryIcon(categoryKey: string | undefined) {
    switch (categoryKey) {
        case "weapon":
            return FaKhanda;
        case "armor":
        case "shield":
            return FaShieldHalved;
        case "consumable":
        case "potion":
        case "ammunition":
            return FaBottleWater;
        case "tool":
        case "tools":
            return FaHammer;
        case "equipment-pack":
        case "pack":
            return FaBox;
        default:
            return FaBox;
    }
}

export function InventoryItemCard({
    row,
    system,
    characterId,
    equipped,
}: InventoryItemCardProps) {
    const t = useTranslations("playerSheet.inventory");
    const tRoot = useTranslations();
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const equipItem = useCharacterStore((state) => state.equipItem);
    const unequipItem = useCharacterStore((state) => state.unequipItem);

    const entry = getItem(row.slug, system, contentLocale);
    const name = entry?.name ?? row.slug;
    const description = entry?.description;
    const Icon = categoryIcon(entry?.category?.key);
    const slots = getEquipmentSlots(system);
    const slugAlreadyEquipped = isSlugEquipped(equipped, row.slug);

    return (
        <article
            className={cn("flex flex-col gap-2 rounded-xl p-3", sheetInset)}
            data-testid={`inventory-card-${row.key}`}
        >
            <div className="flex items-start justify-between gap-2">
                <Icon
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                />
                <div className="flex items-center gap-1">
                    {row.equipped ? (
                        <span className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("equippedBadge")}
                        </span>
                    ) : null}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                aria-label={t("actions")}
                            >
                                <FaEllipsisVertical className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {row.equipped && row.slotId ? (
                                <DropdownMenuItem
                                    onSelect={() =>
                                        unequipItem(characterId, row.slotId!)
                                    }
                                >
                                    {t("unequip")}
                                </DropdownMenuItem>
                            ) : (
                                slots.map((slot) => {
                                    const canEquip =
                                        !slugAlreadyEquipped &&
                                        canEquipSlugToSlot(
                                            equipped,
                                            slot.id,
                                            row.slug
                                        );
                                    const slotLabel = tRoot(slot.labelKey);
                                    return (
                                        <DropdownMenuItem
                                            key={slot.id}
                                            disabled={!canEquip}
                                            onSelect={() =>
                                                equipItem(
                                                    characterId,
                                                    slot.id,
                                                    row.slug
                                                )
                                            }
                                        >
                                            {t("equipToSlot", {
                                                slot: slotLabel,
                                            })}
                                        </DropdownMenuItem>
                                    );
                                })
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="min-w-0">
                <h3 className="font-semibold leading-tight">{name}</h3>
                {description ? (
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7 pointer-events-none opacity-60"
                        disabled
                        aria-hidden
                        tabIndex={-1}
                    >
                        <FaMinus className="size-3" />
                    </Button>
                    <span className="min-w-[3rem] text-center text-sm tabular-nums">
                        {t("quantity", { count: row.quantity })}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7 pointer-events-none opacity-60"
                        disabled
                        aria-hidden
                        tabIndex={-1}
                    >
                        <FaPlus className="size-3" />
                    </Button>
                </div>
            </div>
        </article>
    );
}
