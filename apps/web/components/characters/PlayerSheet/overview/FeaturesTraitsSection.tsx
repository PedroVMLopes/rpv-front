"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FaChevronDown } from "react-icons/fa6";
import type { ModifierSourceType } from "@rpv/domain";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    listOverviewTraitGroups,
    type OverviewTrait,
} from "@/lib/character/overviewTraits";
import { useContentLocale } from "@/store/useContentLocale";
import { OverviewPanel } from "./OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

type FeaturesTraitsSectionProps = {
    stored: StoredCharacter;
};

function localizedTraitName(
    trait: OverviewTrait,
    visionLabel: string
): string {
    if (trait.slug === "vision") {
        return visionLabel;
    }

    return trait.name;
}

export function FeaturesTraitsSection({ stored }: FeaturesTraitsSectionProps) {
    const t = useTranslations("playerSheet");
    const tCharacter = useTranslations("character");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const groups = useMemo(
        () => listOverviewTraitGroups(stored, contentLocale),
        [contentLocale, stored]
    );

    if (groups.length === 0) {
        return null;
    }

    const sourceLabel = (sourceType: ModifierSourceType) => {
        switch (sourceType) {
            case "race":
                return t("traitSource.race");
            case "class":
                return t("traitSource.class");
            case "subclass":
                return t("traitSource.subclass");
            case "background":
                return t("traitSource.background");
            case "item":
                return t("traitSource.item");
            case "feat":
                return t("traitSource.feat");
            case "spell":
                return t("traitSource.spell");
            case "condition":
                return t("traitSource.condition");
            case "system":
                return t("traitSource.system");
        }
    };

    return (
        <OverviewPanel title={t("featuresTraitsTitle")}>
            <div className="flex flex-col gap-3">
                {groups.map((group) => (
                    <div key={group.sourceType}>
                        {groups.length > 1 ? (
                            <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                                {sourceLabel(group.sourceType)}
                            </p>
                        ) : null}
                        <ul className="flex flex-col gap-1.5">
                            {group.traits.map((trait) => (
                                <li key={trait.id}>
                                    <details
                                        className={cn(
                                            "group rounded-xl",
                                            sheetInset
                                        )}
                                    >
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                                            <span>
                                                {localizedTraitName(
                                                    trait,
                                                    tCharacter("vision")
                                                )}
                                            </span>
                                            {trait.description ? (
                                                <FaChevronDown
                                                    className="size-3 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                                    aria-hidden
                                                />
                                            ) : null}
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
                    </div>
                ))}
            </div>
        </OverviewPanel>
    );
}
