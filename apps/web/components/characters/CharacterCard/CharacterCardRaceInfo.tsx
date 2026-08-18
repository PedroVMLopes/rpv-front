"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FaChevronDown } from "react-icons/fa6";
import type { Locale } from "@rpv/domain";
import { contentRepo } from "@/lib/content/contentRepository";
import { useContentLocale } from "@/store/useContentLocale";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    getRaceLineFromSelections,
    getRaceTraitDisplay,
    resolveRaceDisplayName,
    resolveSubraceDisplayName,
} from "@/lib/character/raceDisplay";
import { collectPendingDecisionsFromStored } from "@/lib/character/pendingDecisions";
import { presets } from "@/presets";
import { PendingDecisionsPanel } from "@/components/characters/PendingDecisionsPanel";
import { SheetPanel } from "@/components/characters/SheetPanel";
import { sheetInset } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import { cn } from "@/lib/utils";

function resolveClassName(classSlug: string | undefined, locale: Locale): string {
    if (!classSlug) {
        return "";
    }
    return contentRepo().getClass(classSlug, locale)?.name ?? classSlug;
}

function resolveSubclassName(
    subclassSlug: string | undefined,
    locale: Locale
): string {
    if (!subclassSlug) {
        return "";
    }
    return contentRepo().getSubclass(subclassSlug, locale)?.name ?? subclassSlug;
}

function resolveBackgroundName(
    backgroundSlug: string | undefined,
    fallback: unknown
): string {
    const slug =
        backgroundSlug?.trim() ||
        (typeof fallback === "string" && fallback.trim() ? fallback.trim() : "");
    if (!slug) {
        return "";
    }
    return contentRepo().getBackground(slug)?.name ?? slug;
}

/** Compact card: subrace if present, otherwise race; background on a second line. */
export function RaceBackgroundBlock({ stored }: { stored: StoredCharacter }) {
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const subraceName = resolveSubraceDisplayName(
        stored.selections.subrace,
        contentLocale
    );
    const raceName = resolveRaceDisplayName(stored.selections.race, contentLocale);
    const primary = subraceName ?? raceName ?? "";
    const backgroundStr = resolveBackgroundName(
        stored.selections.background,
        stored.systemData.background
    );

    if (!primary && !backgroundStr) {
        return null;
    }

    return (
        <div>
            {primary ? <p className="font-bold">{primary}</p> : null}
            {backgroundStr ? <p className="text-sm">{backgroundStr}</p> : null}
        </div>
    );
}

/** Compact card: class + subclass only (no race mixed in). */
export function ClassSubclassOnlyBlock({ stored }: { stored: StoredCharacter }) {
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const classStr = resolveClassName(
        stored.selections.characterClass,
        contentLocale
    );
    const subclassStr = resolveSubclassName(
        stored.selections.subclass,
        contentLocale
    );

    if (!classStr && !subclassStr) {
        return null;
    }

    return (
        <div>
            {classStr ? <p className="font-bold">{classStr}</p> : null}
            {subclassStr ? <p className="text-sm">{subclassStr}</p> : null}
        </div>
    );
}

/** Expanded dialog identity line: Race · Subrace Class + subclass below. */
export function ClassSubclassBlock({ stored }: { stored: StoredCharacter }) {
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const raceLine = getRaceLineFromSelections(stored.selections, contentLocale);
    const classStr = resolveClassName(
        stored.selections.characterClass,
        contentLocale
    );
    const subclassStr = resolveSubclassName(
        stored.selections.subclass,
        contentLocale
    );
    const title = [raceLine, classStr].filter(Boolean).join(" ");

    if (!title && !subclassStr) {
        return null;
    }

    return (
        <div>
            {title ? <p className="font-bold">{title}</p> : null}
            {subclassStr ? <p className="text-sm">{subclassStr}</p> : null}
        </div>
    );
}

export function UnresolvedChoicesBlock({
    stored,
    panelVariant = "default",
}: {
    stored: StoredCharacter;
    panelVariant?: "default" | "nested";
}) {
    const statConfig = presets[stored.system].presetData.statConfig;
    const decisions = useMemo(
        () => collectPendingDecisionsFromStored(stored, statConfig),
        [stored]
    );

    return (
        <PendingDecisionsPanel
            decisions={decisions}
            editBaseHref={`/characters/player/edit/${stored.id}`}
            panelVariant={panelVariant}
        />
    );
}

export function RaceTraitsBlock({
    stored,
    panelVariant = "default",
}: {
    stored: StoredCharacter;
    panelVariant?: "default" | "nested";
}) {
    const t = useTranslations("character");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const { traits } = getRaceTraitDisplay(stored.selections, contentLocale);

    if (traits.length === 0) {
        return null;
    }

    return (
        <SheetPanel title={t("traits")} variant={panelVariant}>
            <ul className="flex flex-col gap-1.5">
                {traits.map((trait) => (
                    <li key={trait.slug}>
                        <details className={cn("group rounded-xl", sheetInset)}>
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                                <span>
                                    {trait.slug === "vision"
                                        ? t("vision")
                                        : trait.name}
                                </span>
                                <FaChevronDown
                                    className="size-3 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                    aria-hidden
                                />
                            </summary>
                            {trait.description ? (
                                <div className="border-t px-3 py-2 text-sm text-muted-foreground">
                                    {trait.description}
                                </div>
                            ) : null}
                        </details>
                    </li>
                ))}
            </ul>
        </SheetPanel>
    );
}
