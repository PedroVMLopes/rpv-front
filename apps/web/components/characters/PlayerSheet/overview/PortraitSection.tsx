"use client";

import { useTranslations } from "next-intl";
import { FaUser } from "react-icons/fa6";
import { getItem } from "@rpv/content";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useContentLocale } from "@/store/useContentLocale";
import { Card } from "@/components/ui/card";
import { sheetPanel } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import { cn } from "@/lib/utils";

function getAvatarUrl(systemData: Record<string, unknown>): string | undefined {
    const avatar = systemData.avatar ?? systemData.image;
    if (typeof avatar === "string" && avatar.trim()) {
        return avatar;
    }
    return undefined;
}

type PortraitSectionProps = {
    stored: StoredCharacter;
};

export function PortraitSection({ stored }: PortraitSectionProps) {
    const t = useTranslations("playerSheet");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const avatarUrl = getAvatarUrl(stored.systemData);
    const armorSlug = stored.selections.inventory?.equipped?.armor;
    const armorName = armorSlug
        ? (getItem(armorSlug, stored.system, contentLocale)?.name ?? armorSlug)
        : null;

    return (
        <Card className={cn("gap-0 overflow-hidden rounded-2xl py-0 shadow-xs", sheetPanel)}>
            <div className="relative aspect-square w-full bg-background/60">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={stored.name}
                        className="size-full object-cover"
                    />
                ) : (
                    <div
                        className="flex size-full items-center justify-center text-muted-foreground"
                        aria-label={t("noPortrait")}
                    >
                        <FaUser className="size-16 opacity-40" aria-hidden />
                    </div>
                )}
                {armorName ? (
                    <div className="absolute inset-x-0 bottom-0 flex justify-center p-2">
                        <span className="rounded-full border bg-card/90 px-3 py-1 text-xs font-semibold backdrop-blur">
                            {t("equippedArmor", { name: armorName })}
                        </span>
                    </div>
                ) : null}
            </div>
        </Card>
    );
}
