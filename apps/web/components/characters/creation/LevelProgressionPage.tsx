"use client";

import { useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { Grant } from "@rpv/content";
import {
    getClassGrantSourcesForLevel,
    getSubclassGrantSourcesForLevel,
} from "@rpv/content";
import type { CreationStepSourceFilter } from "@/lib/character/creationSteps/creationStep.types";
import { GrantPreviewGroupedPanel } from "@/components/characters/creation/GrantPreviewGroupedPanel";
import {
    groupGrantPreviewBuckets,
    hasAnyBucketItems,
    type GrantPreviewContext,
} from "@/lib/character/creation/groupGrantPreviewBuckets";
import {
    buildLevelGainSummary,
    hasLevelGainSummaryContent,
    type LevelGainSummary,
} from "@/lib/character/buildLevelGainSummary";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import { sheetInset } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import type { SystemKey } from "@/presets";
import { cn } from "@/lib/utils";

type LevelProgressionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    sourceFilter?: CreationStepSourceFilter;
    title: string;
};

function resourceLine(
    ref: string,
    amount: number,
    labelFor: (ref: string) => string
): string {
    const sign = amount > 0 ? "+" : "";
    return `${labelFor(ref)}: ${sign}${amount}`;
}

function LevelGainSummaryPanel({ summary }: { summary: LevelGainSummary }) {
    const t = useTranslations("characterCreation.levelSummary");
    const tResources = useTranslations("classResources");

    const labelFor = (ref: string) =>
        formatResourceRefLabel(
            ref,
            (key) => tResources(key),
            (key) => tResources.has(key)
        );

    const hasSpells =
        summary.spellPicks.spells > 0 || summary.spellPicks.cantrips > 0;

    return (
        <div className={cn(sheetInset, "flex flex-col gap-3 rounded-md p-3")}>
            <ul className="flex flex-col gap-2 text-sm">
                {summary.subclassAvailable ? (
                    <li>
                        <span className="font-medium text-foreground">
                            {t("subclassAvailable")}
                        </span>
                    </li>
                ) : null}

                {summary.hp ? (
                    <li>
                        <span className="font-medium text-foreground">
                            {t("hitPoints")}
                            {": "}
                        </span>
                        <span className="text-muted-foreground">
                            {t("hpChange", {
                                before: summary.hp.before,
                                after: summary.hp.after,
                            })}
                        </span>
                    </li>
                ) : null}

                {summary.classResources.length > 0 ? (
                    <li className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                            {t("classResources")}
                        </span>
                        <ul className="list-inside list-disc text-muted-foreground">
                            {summary.classResources.map((entry) => (
                                <li key={entry.ref}>
                                    {resourceLine(
                                        entry.ref,
                                        entry.amount,
                                        labelFor
                                    )}
                                </li>
                            ))}
                        </ul>
                    </li>
                ) : null}

                {summary.subclassResources.length > 0 ? (
                    <li className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                            {t("subclassResources")}
                        </span>
                        <ul className="list-inside list-disc text-muted-foreground">
                            {summary.subclassResources.map((entry) => (
                                <li key={entry.ref}>
                                    {resourceLine(
                                        entry.ref,
                                        entry.amount,
                                        labelFor
                                    )}
                                </li>
                            ))}
                        </ul>
                    </li>
                ) : null}

                {hasSpells ? (
                    <li className="flex flex-col gap-1">
                        {summary.spellPicks.cantrips > 0 ? (
                            <span className="text-muted-foreground">
                                {t("cantripsGained", {
                                    count: summary.spellPicks.cantrips,
                                })}
                            </span>
                        ) : null}
                        {summary.spellPicks.spells > 0 ? (
                            <span className="text-muted-foreground">
                                {t("spellsGained", {
                                    count: summary.spellPicks.spells,
                                })}
                            </span>
                        ) : null}
                    </li>
                ) : null}
            </ul>
        </div>
    );
}

export function LevelProgressionPage({
    form,
    contentLocale,
    system,
    sourceFilter,
    title,
}: LevelProgressionPageProps) {
    const t = useTranslations("characterCreation");
    const { control } = form;

    const watchedValues = useWatch({ control });
    const classSlug = useWatch({ control, name: "characterClass" });
    const subclassSlug = useWatch({ control, name: "subclass" });
    const level = sourceFilter?.level ?? 1;
    const sourceTypes = sourceFilter?.sourceTypes ?? ["class"];

    const summary = useMemo(
        () =>
            buildLevelGainSummary({
                formValues: (watchedValues ?? {}) as Record<string, unknown>,
                featureLevel: level,
                system,
                contentLocale,
                sourceTypes,
            }),
        [watchedValues, level, system, contentLocale, sourceTypes]
    );

    const previewSections = useMemo(() => {
        const sections: Array<{
            source: { type: "class" | "subclass"; id: string };
            grants: Grant[];
            featureLevel?: number;
        }> = [];

        if (
            sourceTypes.includes("class") &&
            typeof classSlug === "string" &&
            classSlug
        ) {
            for (const block of getClassGrantSourcesForLevel(classSlug, level)) {
                const blockLevel = block.featureLevel;

                if (level === 1) {
                    if (blockLevel !== undefined && blockLevel !== 1) {
                        continue;
                    }
                } else if (blockLevel !== level) {
                    continue;
                }

                sections.push({
                    source: { type: "class", id: classSlug },
                    grants: block.grants,
                    featureLevel: block.featureLevel,
                });
            }
        }

        if (
            sourceTypes.includes("subclass") &&
            typeof subclassSlug === "string" &&
            subclassSlug
        ) {
            for (const block of getSubclassGrantSourcesForLevel(
                subclassSlug,
                level
            )) {
                if (block.featureLevel !== level) {
                    continue;
                }

                sections.push({
                    source: { type: "subclass", id: subclassSlug },
                    grants: block.grants,
                    featureLevel: block.featureLevel,
                });
            }
        }

        return sections;
    }, [classSlug, subclassSlug, level, sourceTypes]);

    const previewContexts = useMemo(() => {
        const contexts: GrantPreviewContext[] = [];

        for (const section of previewSections) {
            for (const grant of section.grants) {
                // Resources are listed in the structured summary — skip duplicate.
                if (grant.grantType === "resource" && grant.choose === 0) {
                    continue;
                }

                contexts.push({
                    grant,
                    source: section.source,
                    featureLevel: section.featureLevel,
                });
            }
        }

        return contexts;
    }, [previewSections]);

    const hasFixedGrants = useMemo(
        () => hasAnyBucketItems(groupGrantPreviewBuckets(previewContexts)),
        [previewContexts]
    );

    const showSummary = hasLevelGainSummaryContent(summary);
    const showEmpty = !showSummary && !hasFixedGrants;

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">{title}</h2>

            {showSummary ? <LevelGainSummaryPanel summary={summary} /> : null}

            {showEmpty ? (
                <p className="text-sm text-muted-foreground">
                    {t("levelSummary.empty")}
                </p>
            ) : null}

            {hasFixedGrants ? (
                <GrantPreviewGroupedPanel
                    contexts={previewContexts}
                    contentLocale={contentLocale}
                    system={system}
                />
            ) : null}
        </div>
    );
}
