"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Grant } from "@rpv/content";
import { getSpell } from "@rpv/content";
import type { Locale, ModifierSource } from "@rpv/domain";
import { mapGrantPickToStep } from "@/lib/character/creationSteps/mapGrantPickToStep";
import { buildGrantPreviewItems } from "@/lib/character/creation/grantPreviewLabels";
import { contentRepo } from "@/lib/content/contentRepository";
import { buildItemPreviewContentModel } from "@/lib/content/buildItemPreviewContentModel";
import { buildSpellPickContentModel } from "@/lib/content/buildSpellPickContentModel";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import type { SystemKey } from "@/presets";
import { cn } from "@/lib/utils";

type GrantPreviewListProps = {
    grants: Grant[];
    contentLocale: Locale;
    system: SystemKey;
    source: ModifierSource;
    featureLevel?: number;
    mode?: "preview" | "pick-indicator";
    className?: string;
};

function humanizeStepId(stepId: string): string {
    return stepId
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function GrantPreviewList({
    grants,
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
    const tSpells = useTranslations("spells");
    const tContentDetail = useTranslations("contentDetail");

    const [detailModel, setDetailModel] = useState<ContentDetailModel | null>(
        null
    );

    const items = useMemo(
        () =>
            buildGrantPreviewItems(
                grants,
                source,
                contentLocale,
                system,
                (ref) => tAbilities(ref as never),
                (key, values) => tResources(key as never, values as never),
                featureLevel
            ),
        [grants, source, contentLocale, system, featureLevel, tAbilities, tResources]
    );

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
                                <span className="inline-flex rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                                    {deferredLabel}
                                </span>
                            </li>
                        );
                    }

                    const clickable = Boolean(item.spellRef || item.itemRef);

                    return (
                        <li key={item.id}>
                            {clickable ? (
                                <button
                                    type="button"
                                    className="inline-flex rounded-full border bg-muted/50 px-2 py-0.5 text-xs hover:bg-muted"
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
                            ) : (
                                <span className="inline-flex rounded-full border bg-muted/50 px-2 py-0.5 text-xs">
                                    {item.label}
                                </span>
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
