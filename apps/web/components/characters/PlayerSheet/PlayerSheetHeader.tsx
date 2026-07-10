"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FaArrowLeft, FaGear, FaShield } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { HitPointsControl } from "@/components/characters/HitPointsControl";
import { contentRepo } from "@/lib/content/contentRepository";
import { getCharacterWalkSpeed } from "@/lib/character/characterSpeed";
import { computeInitiative } from "@/lib/character/derivedStats";
import { formatModifier } from "@/lib/character/skillModifiers";
import { getRaceLineFromSelections } from "@/lib/character/raceDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import {
    PlayerSheetTabBar,
    type PlayerSheetTabId,
} from "./PlayerSheetTabBar";

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
    const resolved = getResolvedStats(stored.id);

    const systemData = stored.systemData;
    const levelNum = formatLevel(systemData.level);
    const ac = resolved?.armorClass ?? 0;
    const initiative = resolved
        ? computeInitiative(stored.system, resolved)
        : 0;
    const walkSpeed = getCharacterWalkSpeed(stored.selections, contentLocale);

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
                <div className="flex flex-wrap items-start gap-3">
                    <Button asChild size="icon" variant="ghost" aria-label={t("back")}>
                        <Link href="/characters/player">
                            <FaArrowLeft />
                        </Link>
                    </Button>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h1 className="truncate text-2xl font-bold sm:text-3xl font-serif">
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
                            <p className="truncate text-sm font-medium text-muted-foreground">
                                {levelLine}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-stretch">
                        <HitPointsControl
                            characterId={stored.id}
                            className="w-full sm:w-auto"
                        />

                        <div className="flex w-full flex-col justify-center gap-2 sm:w-auto">
                            <div className="flex w-full items-stretch gap-2">
                                <div
                                    className="flex min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border bg-popover px-3 py-2 sm:min-w-16 sm:flex-none"
                                    aria-label={`${tCombat("ac")} ${ac}`}
                                >
                                    <span className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
                                        <FaShield className="size-3" aria-hidden />
                                        {tCombat("ac")}
                                    </span>
                                    <span className="font-bold tabular-nums">
                                        {ac}
                                    </span>
                                </div>

                                <div
                                    className="flex min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border bg-popover px-3 py-2 sm:min-w-16 sm:flex-none"
                                    aria-label={`${tCharacter("initiative")} ${formatModifier(initiative)}`}
                                >
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                        {tCharacter("initiative")}
                                    </span>
                                    <span className="font-bold tabular-nums">
                                        {formatModifier(initiative)}
                                    </span>
                                </div>
                            </div>

                            {walkSpeed !== undefined ? (
                                <div
                                    className="flex w-full flex-row items-center justify-center rounded-2xl border bg-popover px-3 py-2 gap-2"
                                    aria-label={`${t("speed")} ${t("speedValue", { speed: walkSpeed })}`}
                                >
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                        {t("speed")}
                                    </span>
                                    <span className="font-bold tabular-nums">
                                        {t("speedValue", { speed: walkSpeed })}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <PlayerSheetTabBar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                />
            </div>
        </header>
    );
}
