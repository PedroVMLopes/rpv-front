"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Grant } from "@rpv/content";
import { getSpell } from "@rpv/content";
import type { Locale, ModifierSource } from "@rpv/domain";
import { mapGrantPickToStep } from "@/lib/character/creationSteps/mapGrantPickToStep";
import {
    buildGrantPreviewItems,
    type GrantPreviewItem,
} from "@/lib/character/creation/grantPreviewLabels";
import type { GrantPreviewContext } from "@/lib/character/creation/groupGrantPreviewBuckets";
import type { SpellSlotLabelTranslate } from "@/lib/character/spellSlotResources";
import { contentRepo } from "@/lib/content/contentRepository";
import { buildItemPreviewContentModel } from "@/lib/content/buildItemPreviewContentModel";
import { buildSpellPickContentModel } from "@/lib/content/buildSpellPickContentModel";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import { Badge } from "@/components/ui/badge";
import type { SystemKey } from "@/presets";
import { cn } from "@/lib/utils";

type GrantPreviewListProps = {
    grants?: Grant[];
    contexts?: GrantPreviewContext[];
    contentLocale: Locale;
    system: SystemKey;
    source?: ModifierSource;
    featureLevel?: number;
    mode?: "preview" | "pick-indicator" | "fixed-only";
    className?: string;
};

function buildItemsFromContexts(
    contexts: GrantPreviewContext[],
    contentLocale: Locale,
    system: SystemKey,
    translateAbility: (ref: string) => string,
    translateResource: (ref: string) => string,
    translateSpellSlots?: SpellSlotLabelTranslate
): GrantPreviewItem[] {
    return contexts.flatMap(({ grant, source, featureLevel }, contextIndex) =>
        buildGrantPreviewItems(
            [grant],
            source,
            contentLocale,
            system,
            translateAbility,
            translateResource,
            featureLevel,
            translateSpellSlots
        ).map((item) => ({
            ...item,
            id: `${source.type}:${source.id}:${featureLevel ?? "base"}:${contextIndex}:${item.id}`,
        }))
    );
}

function humanizeStepId(stepId: string): string {
    return stepId
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function GrantPreviewList({
    grants = [],
    contexts,
    contentLocale,
    system,
    source,
    featureLevel,
    mode = "preview",
    className,
}: GrantPreviewListProps) {
    const t = useTranslations("characterCreation");
    const tAbilities = useTranslations("abilities");
    const tResources = useTranslations("classResources");
    const tGrants = useTranslations("grants");
    const tSpells = useTranslations("spells");
    const tContentDetail = useTranslations("contentDetail");

    const [detailModel, setDetailModel] = useState<ContentDetailModel | null>(
        null
    );

    const items = useMemo(() => {
        const translateAbility = (ref: string) => tAbilities(ref as never);
        const translateResource = (key: string, values?: Record<string, unknown>) =>
            tResources(key as never, values as never);
        const translateSpellSlots: SpellSlotLabelTranslate = (key, values) =>
            tGrants(key, values);

        const built = contexts
            ? buildItemsFromContexts(
                  contexts,
                  contentLocale,
                  system,
                  translateAbility,
                  translateResource,
                  translateSpellSlots
              )
            : buildGrantPreviewItems(
                  grants,
                  source!,
                  contentLocale,
                  system,
                  translateAbility,
                  translateResource,
                  featureLevel,
                  translateSpellSlots
              );

        if (mode === "fixed-only") {
            return built.filter((item) => item.kind === "fixed");
        }

        return built;
    }, [
        contexts,
        grants,
        source,
        contentLocale,
        system,
        featureLevel,
        mode,
        tAbilities,
        tGrants,
        tResources,
    ]);

    function openSpellDetail(spellRef: string) {
        const catalogEntry = getSpell(spellRef, contentLocale);

        if (!catalogEntry) {
            return;
        }

        const { detail } = buildSpellPickContentModel(catalogEntry, {
            tSpells: (key, values) => tSpells(key as never, values as never),
            tAbilities: (key) => tAbilities(key),
            tContentDetail: (key) => tContentDetail(key as never),
            tUse: () => tContentDetail("use"),
            missingValue: "—",
        });

        setDetailModel(detail);
    }

    function openItemDetail(itemRef: string) {
        const item = contentRepo(system).getItem(itemRef, contentLocale);

        if (!item) {
            return;
        }

        setDetailModel(buildItemPreviewContentModel(item).detail);
    }

    if (items.length === 0) {
        return null;
    }

    return (
        <>
            <ul
                className={cn(
                    "flex flex-wrap gap-1.5",
                    mode === "pick-indicator" && "text-xs",
                    className
                )}
            >
                {items.map((item) => {
                    if (item.kind === "deferred") {
                        const stepId = mapGrantPickToStep(
                            item.syntheticKey,
                            item.grant
                        );
                        let deferredLabel: string;

                        try {
                            deferredLabel = t("selection.deferredChoice", {
                                count: item.choose,
                                label: item.label,
                                stepLabel: t(`steps.${stepId}` as never),
                            });
                        } catch {
                            try {
                                deferredLabel = t("selection.deferredChoice", {
                                    count: item.choose,
                                    label: item.label,
                                    stepLabel: humanizeStepId(stepId),
                                });
                            } catch {
                                deferredLabel = t(
                                    "selection.deferredChoiceGeneric"
                                );
                            }
                        }

                        return (
                            <li key={item.id}>
                                <Badge variant="dashed">{deferredLabel}</Badge>
                            </li>
                        );
                    }

                    const clickable = Boolean(item.spellRef || item.itemRef);

                    return (
                        <li key={item.id}>
                            {clickable ? (
                                <Badge asChild variant="secondary">
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();

                                            if (item.spellRef) {
                                                openSpellDetail(item.spellRef);
                                            } else if (item.itemRef) {
                                                openItemDetail(item.itemRef);
                                            }
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                </Badge>
                            ) : (
                                <Badge variant="secondary">{item.label}</Badge>
                            )}
                        </li>
                    );
                })}
            </ul>

            {detailModel ? (
                <ContentDetailModal
                    model={detailModel}
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setDetailModel(null);
                        }
                    }}
                />
            ) : null}
        </>
    );
}
