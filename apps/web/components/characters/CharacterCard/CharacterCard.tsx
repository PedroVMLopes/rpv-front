"use client"

import * as React from "react";
import { Button } from "../../ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "../../ui/card";

import { FaHeart, FaBookmark, FaExpand, FaGear } from "react-icons/fa6";
import { ClassSubclassBlock } from "./CharacterCardRaceInfo";
import CharacterCardExpandedDialog from "./CharacterCardExpandedDialog";
import { useCharacterStore } from "@/store/useCharacterStore";
import Link from "next/link";
import {
    CharacterTitle,
    getAvatarUrl,
    HpAcOverlay,
} from "./characterCardUi";

const HP_RESOURCE = "hp";

interface CharacterCardProps {
    characterId: string;
}

function BackgroundBlock({ background }: { background?: unknown }) {
    if (!background || String(background).trim() === "") {
        return null;
    }

    return (
        <div className="flex flex-col rounded-2xl border bg-popover p-2 px-3 text-popover-foreground">
            <p className="font-bold">{String(background)}</p>
        </div>
    );
}

export default function CharacterCard({ characterId }: CharacterCardProps) {
    const stored = useCharacterStore((state) =>
        state.characters.find((c) => c.id === characterId)
    );
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved = getResolvedStats(characterId);

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
    const avatarUrl = getAvatarUrl(systemData);
    const currentHp = stored.resources[HP_RESOURCE] ?? 0;
    const maxHp = resolved?.hitPoints ?? 0;
    const ac = resolved?.armorClass ?? 0;
    const showHpFooter =
        stored.resources[HP_RESOURCE] !== undefined ||
        currentHp > 0 ||
        maxHp > 0;

    const classBlock = <ClassSubclassBlock stored={stored} />;
    const backgroundBlock = <BackgroundBlock background={systemData.background} />;
    const hasTopInfoBlocks = classBlock !== null || backgroundBlock !== null;

    const imageSection = avatarUrl ? (
        <div className="relative flex min-h-20 max-h-96 min-w-full max-w-96 flex-col items-center overflow-hidden rounded-2xl">
            <img src={avatarUrl} alt={stored.name} className="relative" />
            <HpAcOverlay currentHp={currentHp} maxHp={maxHp} ac={ac} />
        </div>
    ) : null;

    return (
        <Card className="gap-3 p-3 sm:max-w-xs">
            <CardHeader className="flex flex-row items-center justify-between p-0 pl-1">
                <CardTitle className="text-lg font-bold">
                    <CharacterTitle name={stored.name} level={systemData.level} />
                </CardTitle>
                <CardAction className="flex flex-row gap-0">
                    <CharacterCardExpandedDialog
                        characterId={characterId}
                        stored={stored}
                        trigger={
                            <Button
                                size={"icon"}
                                variant={"outline"}
                                aria-label="Expand character"
                            >
                                <FaExpand />
                            </Button>
                        }
                    />
                </CardAction>
            </CardHeader>

            <CardContent className="flex flex-col items-center p-0">
                {imageSection}

                {hasTopInfoBlocks && (
                    <div className="my-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                        {classBlock ? (
                            <div className="rounded-2xl border bg-popover p-2 px-3 text-popover-foreground">
                                {classBlock}
                            </div>
                        ) : null}
                        {backgroundBlock}
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-0">
                <div className="flex w-full flex-row justify-end gap-1">
                    {showHpFooter && (
                        <Button variant={"ghost"} className="font-bold">
                            {currentHp}
                            <FaHeart />
                        </Button>
                    )}
                    <Button variant={"ghost"} className="font-bold">
                        Save
                        <FaBookmark className="text-chart-3" />
                    </Button>
                    <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        aria-label="Edit character"
                    >
                        <Link href={`/characters/${stored.type}/edit/${stored.id}`}>
                            <FaGear />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
