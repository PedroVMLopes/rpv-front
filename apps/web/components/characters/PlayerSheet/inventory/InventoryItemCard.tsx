"use client";

import { useTranslations } from "next-intl";
import { FaMinus, FaPlus } from "react-icons/fa6";
import {
    FaBox,
    FaBottleWater,
    FaHammer,
    FaKhanda,
    FaShieldHalved,
} from "react-icons/fa6";
import { getItem } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { Button } from "@/components/ui/button";
import type { InventoryDisplayRow } from "@/lib/character/inventoryDisplay";
import { cn } from "@/lib/utils";
import { useContentLocale } from "@/store/useContentLocale";
import { sheetInset } from "../playerSheetSurfaces";

type InventoryItemCardProps = {
    row: InventoryDisplayRow;
    system: SystemKey;
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

export function InventoryItemCard({ row, system }: InventoryItemCardProps) {
    const t = useTranslations("playerSheet.inventory");
    const contentLocale = useContentLocale((state) => state.contentLocale);

    const entry = getItem(row.slug, system, contentLocale);
    const name = entry?.name ?? row.slug;
    const description = entry?.description;
    const Icon = categoryIcon(entry?.category?.key);

    return (
        <article
            className={cn("flex flex-col gap-2 rounded-xl p-3", sheetInset)}
        >
            <div className="flex items-start justify-between gap-2">
                <Icon
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                />
                {row.equipped ? (
                    <span className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("equippedBadge")}
                    </span>
                ) : null}
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
