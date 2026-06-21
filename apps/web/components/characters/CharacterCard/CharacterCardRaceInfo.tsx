"use client";

import { useTranslations } from "next-intl";
import { getClass, getSubclass } from "@rpv/content";
import { useContentLocale } from "@/store/useContentLocale";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    formatUnresolvedChoice,
    getRaceLineFromSelections,
    getRaceTraitDisplay,
} from "@/lib/character/raceDisplay";

export function ClassSubclassBlock({ stored }: { stored: StoredCharacter }) {
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const raceLine = getRaceLineFromSelections(stored.selections, contentLocale);
    const classSlug = stored.selections.characterClass;
    const classStr = classSlug
        ? (getClass(classSlug)?.name ?? classSlug)
        : "";
    const subclassSlug = stored.selections.subclass;
    const subclassStr = subclassSlug
        ? (getSubclass(subclassSlug, contentLocale)?.name ?? subclassSlug)
        : "";
    const title = [raceLine, classStr].filter(Boolean).join(" ");

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

export function RaceTraitsBlock({ stored }: { stored: StoredCharacter }) {
    const t = useTranslations("character");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const { traits, unresolvedChoices } = getRaceTraitDisplay(
        stored.selections,
        contentLocale
    );

    if (traits.length === 0 && unresolvedChoices.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col border rounded-2xl mt-2 p-2 px-3 gap-2 bg-popover text-popover-foreground">
            {traits.length > 0 && (
                <>
                    <p className="text-sm opacity-60">{t("traits")}</p>
                    <ul className="space-y-2">
                        {traits.map((trait) => (
                            <li key={trait.slug}>
                                <p className="font-semibold">{trait.name}</p>
                                {trait.description ? (
                                    <p className="text-sm opacity-80">
                                        {trait.description}
                                    </p>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {unresolvedChoices.length > 0 && (
                <div className="space-y-1">
                    <p className="text-sm opacity-60">{t("unresolvedChoices")}</p>
                    <ul className="text-sm opacity-80 list-disc pl-4">
                        {unresolvedChoices.map((choice, index) => (
                            <li key={`${choice.traitName}-${index}`}>
                                {formatUnresolvedChoice(choice)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
