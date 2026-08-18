"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LucideHeart } from "lucide-react";
import { useTranslations } from "next-intl";
import { FaArrowLeft, FaGear, FaShieldHalved } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HitPointsControl } from "@/components/characters/HitPointsControl";
import { contentRepo } from "@/lib/content/contentRepository";
import { getCharacterWalkSpeed } from "@/lib/character/characterSpeed";
import { computeInitiative } from "@/lib/character/derivedStats";
import { formatModifier } from "@/lib/character/skillModifiers";
import { getRaceLineFromSelections } from "@/lib/character/raceDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { cn } from "@/lib/utils";
import {
    PlayerSheetTabBar,
    type PlayerSheetTabId,
} from "./PlayerSheetTabBar";

const HP_RESOURCE = "hp";

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

type CombatStatsBlockProps = {
    characterId: string;
    ac: number;
    initiative: number;
    walkSpeed: number | undefined;
    className?: string;
};

function CombatStatsBlock({
    characterId,
    ac,
    initiative,
    walkSpeed,
    className,
}: CombatStatsBlockProps) {
    const t = useTranslations("playerSheet");
    const tCharacter = useTranslations("character");
    const tCombat = useTranslations("combat");

    return (
        <div
            className={cn(
                "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-stretch",
                className
            )}
        >

            <div className="flex w-full flex-col justify-center gap-2 sm:w-auto">
                <div className="flex w-full items-stretch gap-2">
                    <div
                        className="flex min-w-0 flex-1 flex-row items-center justify-center gap-1 rounded-2xl sm:border-3 sm:bg-accent sm:text-accent-foreground px-3 py-2 sm:min-w-16 sm:flex-none"
                        aria-label={`${tCombat("ac")} ${ac}`}
                    >
                        <span className="flex items-center gap-1 text-xs font-semibold uppercase">
                            <FaShieldHalved
                                className="size-4"
                                aria-hidden
                            />
                        </span>
                        <span className="font-bold tabular-nums">
                            <p>{ac}</p>
                        </span>
                    </div>

                    <div
                        className="flex min-w-0 flex-1 flex-row items-center justify-center gap-1 rounded-2xl sm:border-3 sm:bg-accent sm:text-accent-foreground px-3 py-2 sm:min-w-16 sm:flex-none"
                        aria-label={`${tCharacter("initiative")} ${formatModifier(initiative)}`}
                    >
                        <span className="text-sm font-semibold font-serif">
                            {tCharacter("initiative")}
                        </span>
                        <span className="font-bold tabular-nums">
                            {formatModifier(initiative)}
                        </span>
                    </div>
                </div>

                {walkSpeed !== undefined ? (
                    <div
                        className="flex w-full flex-row items-center justify-center rounded-2xl sm:border-3 sm:bg-accent sm:text-accent-foreground px-3 py-2 gap-1"
                        aria-label={`${t("speed")} ${t("speedValue", { speed: walkSpeed })}`}
                    >
                        <span className="text-sm font-semibold font-serif">
                            {t("speed")}
                        </span>
                        <span className="font-bold tabular-nums">
                            {t("speedValue", { speed: walkSpeed })}
                        </span>
                    </div>
                ) : null}
            </div>

            <HitPointsControl
                characterId={characterId}
                className="w-full sm:w-auto"
            />
        </div>
    );
}

type PlayerSheetHeaderProps = {
    stored: StoredCharacter;
    activeTab: PlayerSheetTabId;
    onTabChange: (tab: PlayerSheetTabId) => void;
};

export function PlayerSheetHeader({
    stored,
    activeTab,
    onTabChange,
}: PlayerSheetHeaderProps) {
    const t = useTranslations("playerSheet");
    const tCharacter = useTranslations("character");
    const tCombat = useTranslations("combat");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const currentHp = useCharacterStore(
        (state) =>
            state.characters.find((c) => c.id === stored.id)?.resources[
                HP_RESOURCE
            ] ?? 0
    );
    const resolved = getResolvedStats(stored.id);
    const [combatOpen, setCombatOpen] = useState(false);

    const systemData = stored.systemData;
    const levelNum = formatLevel(systemData.level);
    const ac = resolved?.armorClass ?? 0;
    const maxHp = resolved?.hitPoints ?? 0;
    const initiative = resolved
        ? computeInitiative(stored.system, resolved)
        : 0;
    const walkSpeed = getCharacterWalkSpeed(stored.selections, contentLocale);
    const initiativeLabel = formatModifier(initiative);

    const raceLine = getRaceLineFromSelections(
        stored.selections,
        contentLocale
    );
    const classSlug = stored.selections.characterClass;
    const className = classSlug
        ? (contentRepo().getClass(classSlug, contentLocale)?.name ?? classSlug)
        : "";
    const subclassSlug = stored.selections.subclass;
    const subclassName = subclassSlug
        ? (contentRepo().getSubclass(subclassSlug, contentLocale)?.name ??
          subclassSlug)
        : "";

    const identityParts = [raceLine, className].filter(Boolean);
    let identityLine = identityParts.join(" ");
    if (subclassName) {
        identityLine = identityLine
            ? `${identityLine} (${subclassName})`
            : subclassName;
    }
    const levelLine =
        levelNum !== undefined
            ? identityLine
                ? `${t("levelLine", { level: levelNum })} · ${identityLine}`
                : t("levelLine", { level: levelNum })
            : identityLine;

    return (
        <header className="sticky top-0 z-10 pt-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start gap-2">
                    <Button asChild size="icon" variant="ghost" aria-label={t("back")}>
                        <Link href="/characters/player">
                            <FaArrowLeft />
                        </Link>
                    </Button>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h1 className="truncate text-lg font-bold sm:text-3xl font-serif">
                                {stored.name}
                            </h1>
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                aria-label={t("edit")}
                            >
                                <Link
                                    href={`/characters/player/edit/${stored.id}`}
                                >
                                    <FaGear />
                                </Link>
                            </Button>
                        </div>
                        {levelLine ? (
                            <p className="truncate text-xs sm:text-sm font-medium">
                                {levelLine}
                            </p>
                        ) : null}
                    </div>

                    <Collapsible
                        open={combatOpen}
                        onOpenChange={setCombatOpen}
                        className="w-full sm:hidden bg-card text-card-foreground shadow-xs border-custom border-background rounded-lg"
                    >
                        {!combatOpen ? (
                            <CollapsibleTrigger
                                className="flex w-full items-center justify-between gap-2 p-2 text-sm"
                                aria-label={t("toggleCombatStats")}
                            >
                                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                                    <span
                                        className="inline-flex items-center gap-1 font-semibold tabular-nums"
                                        aria-label={`${t("hitPoints")} ${currentHp} / ${maxHp}`}
                                    >
                                        <LucideHeart
                                            className="size-4 text-primary"
                                            aria-hidden
                                        />
                                        {currentHp}
                                        <span className="opacity-50">
                                            /{maxHp}
                                        </span>
                                    </span>
                                    <span
                                        className="inline-flex items-center gap-1 font-semibold tabular-nums"
                                        aria-label={`${tCombat("ac")} ${ac}`}
                                    >
                                        <FaShieldHalved
                                            className="size-3.5 text-primary"
                                            aria-hidden
                                        />
                                        {ac}
                                    </span>
                                    <span
                                        className="font-medium tabular-nums"
                                        aria-label={`${tCharacter("initiative")} ${initiativeLabel}`}
                                    >
                                        {tCharacter("initiative")}:{" "}
                                        {initiativeLabel}
                                    </span>
                                </div>
                                <ChevronDown
                                    className="size-5 shrink-0 text-primary"
                                    aria-hidden
                                />
                            </CollapsibleTrigger>
                        ) : null}

                        <CollapsibleContent className="data-[state=closed]:hidden">
                            <div className="flex flex-col gap-1 p-1">
                                <div className="flex justify-end">
                                    <CollapsibleTrigger
                                        className="inline-flex items-center justify-center p-1"
                                        aria-label={t("toggleCombatStats")}
                                    >
                                        <ChevronDown
                                            className="size-5 rotate-180 transition-transform text-primary"
                                            aria-hidden
                                        />
                                    </CollapsibleTrigger>
                                </div>
                                <CombatStatsBlock
                                    characterId={stored.id}
                                    ac={ac}
                                    initiative={initiative}
                                    walkSpeed={walkSpeed}
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <CombatStatsBlock
                        characterId={stored.id}
                        ac={ac}
                        initiative={initiative}
                        walkSpeed={walkSpeed}
                        className="hidden sm:flex"
                    />
                </div>

                <PlayerSheetTabBar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                />
            </div>
        </header>
    );
}
