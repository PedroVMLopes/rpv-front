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
import type { SystemKey } from "@/presets";

type LevelProgressionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    sourceFilter?: CreationStepSourceFilter;
    title: string;
    pickStepIds?: string[];
    onStepSelect?: (stepId: string) => void;
};

export function LevelProgressionPage({
    form,
    contentLocale,
    system,
    sourceFilter,
    title,
    pickStepIds = [],
    onStepSelect,
}: LevelProgressionPageProps) {
    const t = useTranslations("characterCreation");
    const { control } = form;

    const classSlug = useWatch({ control, name: "characterClass" });
    const subclassSlug = useWatch({ control, name: "subclass" });
    const level = sourceFilter?.level ?? 1;
    const sourceTypes = sourceFilter?.sourceTypes ?? ["class"];

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

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">{title}</h2>

            {!hasFixedGrants ? (
                <p className="text-sm text-muted-foreground">
                    No automatic gains at this level.
                </p>
            ) : (
                <GrantPreviewGroupedPanel
                    contexts={previewContexts}
                    contentLocale={contentLocale}
                    system={system}
                />
            )}

            {pickStepIds.length > 0 && onStepSelect ? (
                <ul className="flex flex-col gap-2 border-t pt-4">
                    {pickStepIds.map((stepId) => {
                        let stepLabel: string;

                        try {
                            stepLabel = t(`steps.${stepId}` as never);
                        } catch {
                            stepLabel = stepId;
                        }

                        return (
                            <li key={stepId}>
                                <button
                                    type="button"
                                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                                    onClick={() => onStepSelect(stepId)}
                                >
                                    {t("selection.goToStep", { stepLabel })}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
}
