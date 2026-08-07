"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FaUser } from "react-icons/fa6";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { readCharacterLevel } from "@/lib/character/skillModifiers";
import { Button } from "@/components/ui/button";
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
    const avatarUrl = getAvatarUrl(stored.systemData);
    const level = readCharacterLevel(stored.systemData);

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
                {level < 20 ? (
                    <div className="absolute inset-x-0 bottom-0 flex justify-center p-2">
                        <Button asChild size="sm" className="shadow-sm">
                            <Link
                                href={`/characters/player/edit/${stored.id}?mode=level-up&from=${level}`}
                            >
                                {t("levelUp")}
                            </Link>
                        </Button>
                    </div>
                ) : null}
            </div>
        </Card>
    );
}
