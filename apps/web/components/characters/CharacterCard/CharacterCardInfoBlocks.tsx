"use client";

import { CarouselItem } from "@/components/ui/characterCarousel";
import { useCharacterStore } from "@/store/useCharacterStore";
import {
    ClassSubclassBlock,
    RaceTraitsBlock,
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
    const classBlock = (
        <ClassSubclassBlock
            stored={stored}
            characterClass={systemData.characterClass}
            subclass={systemData.subclass}
        />
    );
    const backgroundBlock = <BackgroundBlock background={systemData.background} />;
    const goals =
        systemData.goals !== undefined &&
        systemData.goals !== null &&
        String(systemData.goals).trim() !== ""
            ? String(systemData.goals)
            : null;

    const hasTopBlocks = classBlock !== null || backgroundBlock !== null;

    if (!hasTopBlocks && !goals && !hasTraits) {
        return (
            <CarouselItem>
                <div className="text-muted-foreground text-sm p-2">
                    No character details yet.
                </div>
            </CarouselItem>
        );
    }

    return (
        <CarouselItem>
            {hasTopBlocks && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {classBlock}
                    {backgroundBlock}
                </div>
            )}

            {hasTraits && <RaceTraitsBlock stored={stored} />}

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
