"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CarouselItem } from "@/components/ui/characterCarousel";
import { Button } from "@/components/ui/button";
import { useCharacterStore } from "@/store/useCharacterStore";
import {
    ClassSubclassBlock,
    RaceTraitsBlock,
    UnresolvedChoicesBlock,
} from "./CharacterCardRaceInfo";
import { getRaceTraitDisplay } from "@/lib/character/raceDisplay";
import { useContentLocale } from "@/store/useContentLocale";

interface CharacterCardInfoBlocksProps {
    characterId: string;
}

function BackgroundBlock({ background }: { background?: unknown }) {
    if (!background || String(background).trim() === "") {
        return null;
    }

    return (
        <div className="flex flex-col border rounded-2xl p-2 px-3 bg-popover text-popover-foreground">
            <p className="font-bold">{String(background)}</p>
        </div>
    );
}

export default function CharacterCardInfoBlocks({
    characterId,
}: CharacterCardInfoBlocksProps) {
    const t = useTranslations("playerSheet");
    const stored = useCharacterStore((state) =>
        state.characters.find((c) => c.id === characterId)
    );
    const contentLocale = useContentLocale((state) => state.contentLocale);

    if (!stored) {
        return null;
    }

    const systemData = stored.systemData;
    const { traits, unresolvedChoices } = getRaceTraitDisplay(
        stored.selections,
        contentLocale
    );
    const hasTraits = traits.length > 0 || unresolvedChoices.length > 0;
    const classBlock = <ClassSubclassBlock stored={stored} />;
    const backgroundBlock = <BackgroundBlock background={systemData.background} />;
    const goals =
        systemData.goals !== undefined &&
        systemData.goals !== null &&
        String(systemData.goals).trim() !== ""
            ? String(systemData.goals)
            : null;

    const hasTopBlocks = classBlock !== null || backgroundBlock !== null;
    const openSheetCta = (
        <Button asChild className="mb-3 w-full font-semibold" size="sm">
            <Link href={`/characters/player/${characterId}`}>
                {t("openFullSheet")}
            </Link>
        </Button>
    );

    if (!hasTopBlocks && !goals && !hasTraits) {
        return (
            <CarouselItem>
                {openSheetCta}
                <div className="text-muted-foreground text-sm p-2">
                    No character details yet.
                </div>
            </CarouselItem>
        );
    }

    return (
        <CarouselItem>
            {openSheetCta}

            {hasTopBlocks && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {classBlock}
                    {backgroundBlock}
                </div>
            )}

            {unresolvedChoices.length > 0 ? (
                <div className="mt-2">
                    <UnresolvedChoicesBlock stored={stored} />
                </div>
            ) : null}
            {traits.length > 0 ? (
                <div className="mt-2">
                    <RaceTraitsBlock stored={stored} />
                </div>
            ) : null}

            {goals && (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col border rounded-2xl mt-2 p-2 px-3 gap-1 bg-popover text-popover-foreground">
                        <p className="text-sm opacity-60">Objectives</p>
                        <p>{goals}</p>
                    </div>
                </div>
            )}
        </CarouselItem>
    );
}
