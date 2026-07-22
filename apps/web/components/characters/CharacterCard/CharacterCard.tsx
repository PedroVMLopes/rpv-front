"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FaExpand, FaGear } from "react-icons/fa6";
import { Button } from "../../ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../ui/card";
import {
    ClassSubclassOnlyBlock,
    RaceBackgroundBlock,
} from "./CharacterCardRaceInfo";
import CharacterCardExpandedDialog from "./CharacterCardExpandedDialog";
import { useCharacterStore } from "@/store/useCharacterStore";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { CharacterTitle } from "./characterCardUi";

interface CharacterCardProps {
    characterId: string;
}

function hasRaceBackgroundInfo(stored: StoredCharacter): boolean {
    if (stored.selections.subrace || stored.selections.race) {
        return true;
    }
    const background = stored.systemData.background;
    return (
        background !== undefined &&
        background !== null &&
        String(background).trim() !== ""
    );
}

function hasClassSubclassInfo(stored: StoredCharacter): boolean {
    return Boolean(
        stored.selections.characterClass || stored.selections.subclass
    );
}

export default function CharacterCard({ characterId }: CharacterCardProps) {
    const t = useTranslations("playerSheet");
    const stored = useCharacterStore((state) =>
        state.characters.find((c) => c.id === characterId)
    );

    if (!stored) {
        return (
            <Card className="gap-3 p-3 sm:max-w-xs">
                <CardContent className="p-4 text-sm text-muted-foreground">
                    Character not found.
                </CardContent>
            </Card>
        );
    }

    const systemData = stored.systemData;
    const showRaceBlock = hasRaceBackgroundInfo(stored);
    const showClassBlock = hasClassSubclassInfo(stored);

    return (
        <Card className="gap-3 p-3 sm:max-w-xs">
            <CardHeader className="flex flex-row items-center justify-between p-0 pl-1">
                <CardTitle className="text-lg font-bold font-serif">
                    <CharacterTitle name={stored.name} level={systemData.level} />
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center p-0">
                {(showRaceBlock || showClassBlock) && (
                    <div className="my-2 grid w-full grid-cols-2 gap-2">
                        {showRaceBlock ? (
                            <div className="rounded-2xl border bg-popover p-2 px-3 text-popover-foreground">
                                <RaceBackgroundBlock stored={stored} />
                            </div>
                        ) : null}
                        {showClassBlock ? (
                            <div className="rounded-2xl border bg-popover p-2 px-3 text-popover-foreground">
                                <ClassSubclassOnlyBlock stored={stored} />
                            </div>
                        ) : null}
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-0">
                <div className="flex w-full flex-row items-center gap-1">
                    <Button asChild className="min-w-0 flex-1 font-semibold">
                        <Link href={`/characters/player/${stored.id}`}>
                            {t("openFullSheet")}
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="icon"
                        variant="outline"
                        aria-label="Edit character"
                    >
                        <Link
                            href={`/characters/${stored.type}/edit/${stored.id}`}
                        >
                            <FaGear />
                        </Link>
                    </Button>
                    <CharacterCardExpandedDialog
                        characterId={characterId}
                        stored={stored}
                        trigger={
                            <Button
                                size="icon"
                                variant="outline"
                                aria-label="Expand character"
                            >
                                <FaExpand />
                            </Button>
                        }
                    />
                </div>
            </CardFooter>
        </Card>
    );
}
