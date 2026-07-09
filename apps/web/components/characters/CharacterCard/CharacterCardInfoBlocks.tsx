"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CarouselItem } from "@/components/ui/characterCarousel";
import { Button } from "@/components/ui/button";
import { SheetPanel } from "@/components/characters/SheetPanel";
import { useCharacterStore } from "@/store/useCharacterStore";
import {
    ClassSubclassBlock,
    RaceTraitsBlock,
    UnresolvedChoicesBlock,
} from "./CharacterCardRaceInfo";
import { getRaceTraitDisplay } from "@/lib/character/raceDisplay";
import { useContentLocale } from "@/store/useContentLocale";
import { CharacterCardSlide } from "./characterCardUi";

interface CharacterCardInfoBlocksProps {
    characterId: string;
}

function BackgroundPanel({ background }: { background?: unknown }) {
    const t = useTranslations("fields");

    if (!background || String(background).trim() === "") {
        return null;
    }

    return (
        <SheetPanel title={t("background")}>
            <div className="rounded-xl bg-muted px-3 py-2 text-sm font-semibold">
                {String(background)}
            </div>
        </SheetPanel>
    );
}

export default function CharacterCardInfoBlocks({
    characterId,
}: CharacterCardInfoBlocksProps) {
    const t = useTranslations("playerSheet");
    const tFields = useTranslations("fields");
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
    const backgroundBlock = (
        <BackgroundPanel background={systemData.background} />
    );
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
                <CharacterCardSlide>
                    {openSheetCta}
                    <div className="p-2 text-sm text-muted-foreground">
                        No character details yet.
                    </div>
                </CharacterCardSlide>
            </CarouselItem>
        );
    }

    return (
        <CarouselItem>
            <CharacterCardSlide>
                {openSheetCta}

                {hasTopBlocks && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {classBlock ? (
                            <SheetPanel>
                                <div className="rounded-xl bg-muted p-2 px-3">
                                    {classBlock}
                                </div>
                            </SheetPanel>
                        ) : null}
                        {backgroundBlock}
                    </div>
                )}

                {unresolvedChoices.length > 0 ? (
                    <UnresolvedChoicesBlock stored={stored} />
                ) : null}
                {traits.length > 0 ? (
                    <RaceTraitsBlock stored={stored} />
                ) : null}

                {goals ? (
                    <SheetPanel title={tFields("goals")}>
                        <div className="rounded-xl bg-muted px-3 py-2 text-sm">
                            {goals}
                        </div>
                    </SheetPanel>
                ) : null}
            </CharacterCardSlide>
        </CarouselItem>
    );
}
