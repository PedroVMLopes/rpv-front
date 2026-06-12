"use client"

import * as React from "react";
import { Button } from "../../ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "../../ui/card";

import { FaHeart, FaBookmark, FaShield, FaExpand, FaGear } from "react-icons/fa6";
import CharacterCardInfoBlocks from "./CharacterCardInfoBlocks";
import { Carousel, CarouselApi, CarouselContent, CarouselNext, CarouselPrevious } from "@/components/ui/characterCarousel";
import CharacterCardGameInfo from "./CharacterCardGameInfo";
import CharacterCardInventory from "./CharacterCardInventory";
import CharacterCardAbilities from "./CharacterCardAbilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCharacterStore } from "@/store/useCharacterStore";

const HP_RESOURCE = "hp";

interface CharacterCardProps {
    characterId: string;
}

function getAvatarUrl(systemData: Record<string, unknown>): string | undefined {
    const avatar = systemData.avatar ?? systemData.image;
    if (typeof avatar === "string" && avatar.trim()) {
        return avatar;
    }
    return undefined;
}

function formatLevel(level: unknown): number | undefined {
    if (typeof level === "number" && !Number.isNaN(level)) {
        return level;
    }
    if (typeof level === "string" && level !== "") {
        const parsed = Number(level);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
}

function CharacterTitle({ name, level }: { name: string; level?: unknown }) {
    const levelNum = formatLevel(level);
    return (
        <>
            {name}
            {levelNum !== undefined && (
                <span className="text-sm opacity-50 font-semibold"> lv {levelNum}</span>
            )}
        </>
    );
}

function HpAcOverlay({
    currentHp,
    maxHp,
    ac,
}: {
    currentHp: number;
    maxHp: number;
    ac: number;
}) {
    return (
        <div className="absolute bottom-1 left-1 flex flex-col gap-0.5">
            <div className="flex flex-row items-center backdrop-blur bg-black/15 rounded-2xl p-0.5 px-1.5 font-bold">
                <FaHeart className="mr-1" /> {currentHp}{" "}
                <span className="opacity-60">/{maxHp}</span>
            </div>
            <div className="flex flex-row items-center backdrop-blur-2xl bg-black/15 rounded-2xl p-0.5 px-1.5 font-bold">
                <FaShield className="mr-1" /> {ac}
            </div>
        </div>
    );
}

function ClassSubclassBlock({
    race,
    characterClass,
    subclass,
}: {
    race?: unknown;
    characterClass?: unknown;
    subclass?: unknown;
}) {
    const raceStr = race ? String(race).trim() : "";
    const classStr = characterClass ? String(characterClass).trim() : "";
    const subclassStr = subclass ? String(subclass).trim() : "";
    const title = [raceStr, classStr].filter(Boolean).join(" ");

    if (!title && !subclassStr) {
        return null;
    }

    return (
        <div className="flex flex-col border rounded-2xl p-2 px-3 bg-popover text-popover-foreground">
            {title ? <p className="font-bold">{title}</p> : null}
            {subclassStr ? <p className="text-sm">{subclassStr}</p> : null}
        </div>
    );
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

export default function CharacterCard({ characterId }: CharacterCardProps) {
    const stored = useCharacterStore((state) =>
        state.characters.find((c) => c.id === characterId)
    );
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved = getResolvedStats(characterId);

    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [pageName, setPageName] = React.useState("");

    React.useEffect(() => {
        switch (current) {
            case 1:
                setPageName("Character Info");
                break;
            case 2:
                setPageName("Skills");
                break;
            case 3:
                setPageName("Actions & Abilities");
                break;
            case 4:
                setPageName("Inventory");
                break;
        }
    }, [current]);

    React.useEffect(() => {
        if (!api) {
            return;
        }

        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    if (!stored) {
        return (
            <Card className="p-3 sm:max-w-xs gap-3">
                <CardContent className="p-4 text-muted-foreground text-sm">
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

    const classBlock = (
        <ClassSubclassBlock
            race={systemData.race}
            characterClass={systemData.characterClass}
            subclass={systemData.subclass}
        />
    );
    const backgroundBlock = <BackgroundBlock background={systemData.background} />;
    const hasTopInfoBlocks = classBlock !== null || backgroundBlock !== null;

    const imageSection = avatarUrl ? (
        <div className="flex flex-col items-center overflow-hidden rounded-2xl min-w-full min-h-20 max-h-96 max-w-96 relative">
            <img src={avatarUrl} alt={stored.name} className="relative" />
            <HpAcOverlay currentHp={currentHp} maxHp={maxHp} ac={ac} />
        </div>
    ) : null;

    return (
        <Card className="p-3 sm:max-w-xs gap-3">
            <CardHeader className="p-0 pl-1 flex flex-row items-center justify-between">
                <CardTitle className="font-bold text-lg">
                    <CharacterTitle name={stored.name} level={systemData.level} />
                </CardTitle>
                <CardAction className="flex flex-row gap-0">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size={"icon"} variant={"outline"}>
                                <FaExpand />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm h-[90%] flex flex-col items-center p-3 sm:p-6">
                            <DialogHeader>
                                <DialogTitle className="font-bold text-lg">
                                    <CharacterTitle
                                        name={stored.name}
                                        level={systemData.level}
                                    />
                                </DialogTitle>
                            </DialogHeader>

                            {imageSection}

                            <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
                                <CarouselPrevious />
                                <CarouselNext />
                                <div className="text-muted-foreground text-center text-sm mb-3">
                                    {pageName}
                                </div>

                                <ScrollArea className="h-80 rounded-2xl">
                                    <CarouselContent className="">
                                        <CharacterCardInfoBlocks characterId={characterId} />

                                        <CharacterCardGameInfo characterId={characterId} />

                                        <CharacterCardAbilities />

                                        <CharacterCardInventory />
                                    </CarouselContent>
                                </ScrollArea>
                            </Carousel>
                        </DialogContent>
                    </Dialog>
                </CardAction>
            </CardHeader>

            <CardContent className="p-0 flex flex-col items-center">
                {imageSection}

                {hasTopInfoBlocks && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 w-full">
                        {classBlock}
                        {backgroundBlock}
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-0">
                <div className="flex flex-row w-full justify-end gap-1">
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
                    <Button size={"icon"} variant={"ghost"} className="">
                        <FaGear />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
