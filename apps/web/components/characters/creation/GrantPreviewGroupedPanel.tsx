"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import {
    groupGrantPreviewBuckets,
    hasAnyActionsResourceItems,
    hasAnyProficiencyItems,
    type GrantPreviewContext,
} from "@/lib/character/creation/groupGrantPreviewBuckets";
import type { ResourcePreviewChip } from "@/lib/character/creation/raceCatalogResourceChips";
import { GrantPreviewList } from "@/components/characters/creation/GrantPreviewList";
import { GrantPreviewStaticChips } from "@/components/characters/creation/GrantPreviewStaticChips";
import type { SystemKey } from "@/presets";
import { cn } from "@/lib/utils";

type GrantPreviewGroupedPanelProps = {
    contexts: GrantPreviewContext[];
    contentLocale: Locale;
    system: SystemKey;
    showProficienciesTitle?: boolean;
    extraResourceChips?: ResourcePreviewChip[];
    className?: string;
};

type SubsectionConfig = {
    key: string;
    labelKey: string;
    contexts: GrantPreviewContext[];
};

function renderSubsections(
    subsections: SubsectionConfig[],
    t: ReturnType<typeof useTranslations>,
    contentLocale: Locale,
    system: SystemKey,
    extraResourceChips: ResourcePreviewChip[] = []
) {
    return subsections
        .filter(
            (subsection) =>
                subsection.contexts.length > 0 ||
                (subsection.key === "resources" && extraResourceChips.length > 0)
        )
        .map((subsection) => (
            <section key={subsection.key} className="flex flex-col gap-2">
                <h5 className="text-sm font-semibold">
                    {t(`selection.preview.${subsection.labelKey}` as never)}
                </h5>
                {subsection.key === "resources" &&
                extraResourceChips.length > 0 ? (
                    <GrantPreviewStaticChips chips={extraResourceChips} />
                ) : null}
                {subsection.contexts.length > 0 ? (
                    <GrantPreviewList
                        contexts={subsection.contexts}
                        contentLocale={contentLocale}
                        system={system}
                        mode="fixed-only"
                    />
                ) : null}
            </section>
        ));
}

export function GrantPreviewGroupedPanel({
    contexts,
    contentLocale,
    system,
    showProficienciesTitle = true,
    extraResourceChips = [],
    className,
}: GrantPreviewGroupedPanelProps) {
    const t = useTranslations("characterCreation");

    const buckets = useMemo(
        () => groupGrantPreviewBuckets(contexts, contentLocale),
        [contexts, contentLocale]
    );

    const proficiencySubsections: SubsectionConfig[] = [
        { key: "weapons", labelKey: "weapons", contexts: buckets.proficiencies.weapons },
        { key: "armor", labelKey: "armor", contexts: buckets.proficiencies.armor },
        { key: "skills", labelKey: "skills", contexts: buckets.proficiencies.skills },
        { key: "tools", labelKey: "tools", contexts: buckets.proficiencies.tools },
        {
            key: "languages",
            labelKey: "languages",
            contexts: buckets.proficiencies.languages,
        },
    ];

    const actionsResourceSubsections: SubsectionConfig[] = [
        {
            key: "cantrips",
            labelKey: "cantrips",
            contexts: buckets.actionsAndResources.cantrips,
        },
        {
            key: "spells",
            labelKey: "spells",
            contexts: buckets.actionsAndResources.spells,
        },
        {
            key: "actions",
            labelKey: "actions",
            contexts: buckets.actionsAndResources.actions,
        },
        {
            key: "resources",
            labelKey: "resources",
            contexts: buckets.actionsAndResources.resources,
        },
    ];

    const showProficiencies = hasAnyProficiencyItems(buckets);
    const showActionsResources =
        hasAnyActionsResourceItems(buckets) || extraResourceChips.length > 0;

    if (!showProficiencies && !showActionsResources) {
        return null;
    }

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {showProficiencies ? (
                <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
                    {showProficienciesTitle ? (
                        <h4 className="text-sm font-semibold">
                            {t("selection.preview.proficiencies")}
                        </h4>
                    ) : null}
                    {renderSubsections(
                        proficiencySubsections,
                        t,
                        contentLocale,
                        system
                    )}
                </div>
            ) : null}

            {showActionsResources ? (
                <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
                    {renderSubsections(
                        actionsResourceSubsections,
                        t,
                        contentLocale,
                        system,
                        extraResourceChips
                    )}
                </div>
            ) : null}
        </div>
    );
}
