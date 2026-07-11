"use client";

import { useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import {
    fixedGrantsToCharacterGrants,
    getClassGrantSourcesForLevel,
    getSubclassGrantSourcesForLevel,
} from "@rpv/content";
import type { CreationStepSourceFilter } from "@/lib/character/creationSteps/creationStep.types";
import {
    formatClassStepGrantLabel,
} from "@/lib/character/classStepDisplay";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";

type LevelProgressionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    sourceFilter?: CreationStepSourceFilter;
    title: string;
};

export function LevelProgressionPage({
    form,
    contentLocale,
    sourceFilter,
    title,
}: LevelProgressionPageProps) {
    const tAbilities = useTranslations("abilities");
    const tResources = useTranslations("classResources");
    const { control } = form;

    const classSlug = useWatch({ control, name: "characterClass" });
    const subclassSlug = useWatch({ control, name: "subclass" });
    const level = sourceFilter?.level ?? 1;
    const sourceTypes = sourceFilter?.sourceTypes ?? ["class"];

    const displayGrants = useMemo(() => {
        const grants: ReturnType<typeof fixedGrantsToCharacterGrants> = [];

        if (
            sourceTypes.includes("class") &&
            typeof classSlug === "string" &&
            classSlug
        ) {
            for (const block of getClassGrantSourcesForLevel(classSlug, level)) {
                const blockLevel = block.featureLevel;

                if (level === 1) {
                    if (
                        blockLevel !== undefined &&
                        blockLevel !== 1
                    ) {
                        continue;
                    }
                } else if (blockLevel !== level) {
                    continue;
                }

                const fixed = block.grants.filter((grant) => grant.choose === 0);

                grants.push(
                    ...fixedGrantsToCharacterGrants(
                        fixed,
                        {
                            type: "class",
                            id: classSlug,
                        },
                        { featureLevel: block.featureLevel }
                    )
                );
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

                const fixed = block.grants.filter((grant) => grant.choose === 0);

                grants.push(
                    ...fixedGrantsToCharacterGrants(fixed, {
                        type: "subclass",
                        id: subclassSlug,
                    }, { featureLevel: block.featureLevel })
                );
            }
        }

        return grants;
    }, [classSlug, subclassSlug, level, sourceTypes]);

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">{title}</h2>

            {displayGrants.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No automatic gains at this level.
                </p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {displayGrants.map((grant) => (
                        <li
                            key={grant.id}
                            className="rounded-md border bg-card px-3 py-2 text-sm"
                        >
                            {formatClassStepGrantLabel(
                                grant,
                                contentLocale,
                                (ref) => tAbilities(ref as never),
                                (ref) => formatResourceRefLabel(ref, tResources)
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
