"use client";

import { useTranslations } from "next-intl";
import { FaChevronDown } from "react-icons/fa6";
import { contentRepo } from "@/lib/content/contentRepository";
import { useContentLocale } from "@/store/useContentLocale";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    formatUnresolvedChoice,
    getRaceLineFromSelections,
    getRaceTraitDisplay,
} from "@/lib/character/raceDisplay";
import { SheetPanel } from "@/components/characters/SheetPanel";
import { sheetInset } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import { cn } from "@/lib/utils";

export function ClassSubclassBlock({ stored }: { stored: StoredCharacter }) {
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const raceLine = getRaceLineFromSelections(stored.selections, contentLocale);
    const classSlug = stored.selections.characterClass;
    const classStr = classSlug
        ? (contentRepo().getClass(classSlug, contentLocale)?.name ?? classSlug)
        : "";
    const subclassSlug = stored.selections.subclass;
    const subclassStr = subclassSlug
        ? (contentRepo().getSubclass(subclassSlug, contentLocale)?.name ?? subclassSlug)
        : "";
    const title = [raceLine, classStr].filter(Boolean).join(" ");

    if (!title && !subclassStr) {
        return null;
    }

    return (
        <div className="text-card-foreground">
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
    const t = useTranslations("character");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const { unresolvedChoices } = getRaceTraitDisplay(
        stored.selections,
        contentLocale
    );

    if (unresolvedChoices.length === 0) {
        return null;
    }

    return (
        <SheetPanel title={t("unresolvedChoices")} variant={panelVariant}>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {unresolvedChoices.map((choice, index) => (
                    <li key={`${choice.traitName}-${index}`}>
                        {formatUnresolvedChoice(choice)}
                    </li>
                ))}
            </ul>
        </SheetPanel>
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
                        <details className={cn("group rounded-xl text-card-foreground", sheetInset)}>
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                                <span>{trait.name}</span>
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
