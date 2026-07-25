"use client";

import { useMemo, useState } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { getSpell } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { listKnownLeveledSpellRefs } from "@/lib/character/knownLeveledSpells";
import { readLevelFromForm } from "@/lib/character/level";
import {
    readPreparedSpellsFromForm,
    togglePreparedSpell,
} from "@/lib/character/preparedSpellForm";
import { computePreparedSpellQuotaFromForm } from "@/lib/character/preparedSpellQuota";
import { buildSpellPickContentModel } from "@/lib/content/buildSpellPickContentModel";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import { Button } from "@/components/ui/button";
import type { SystemKey } from "@/presets";
import { cn } from "@/lib/utils";

type PreparedSpellChoiceGridProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
};

export function PreparedSpellChoiceGrid({
    form,
    contentLocale,
    system,
}: PreparedSpellChoiceGridProps) {
    const t = useTranslations("characterCreation");
    const tPrepare = useTranslations("characterCreation.prepareSpells");
    const tSpells = useTranslations("spells");
    const tAbilities = useTranslations("abilities");
    const tContentDetail = useTranslations("contentDetail");

    const formValues = form.watch();
    const preparedSpells = readPreparedSpellsFromForm(form);
    const preparedSet = useMemo(
        () => new Set(preparedSpells),
        [preparedSpells]
    );

    const quota = useMemo(() => {
        return (
            computePreparedSpellQuotaFromForm(
                formValues,
                system,
                contentLocale
            ) ?? 1
        );
    }, [formValues, system, contentLocale]);

    const knownLeveled = useMemo(() => {
        const selections = buildSelectionsFromForm(formValues);
        const characterLevel = readLevelFromForm(formValues);

        return listKnownLeveledSpellRefs({
            selections,
            locale: contentLocale,
            system,
            characterLevel,
        });
    }, [formValues, contentLocale, system]);

    const spellCards = useMemo(() => {
        return knownLeveled.map((slug) => {
            const catalogEntry = getSpell(slug, contentLocale);

            return {
                slug,
                name: catalogEntry?.name ?? slug,
                shortDescription:
                    catalogEntry?.shortDescription.trim() || undefined,
                catalogEntry,
            };
        });
    }, [knownLeveled, contentLocale]);

    const [detailModel, setDetailModel] = useState<ContentDetailModel | null>(
        null
    );

    const poolFull = preparedSpells.length >= quota;

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

    if (spellCards.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">{tPrepare("empty")}</p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                {tPrepare("count", {
                    prepared: preparedSpells.length,
                    quota,
                })}
            </p>
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {spellCards.map((spell) => {
                    const isSelected = preparedSet.has(spell.slug);
                    const selectDisabled = poolFull && !isSelected;

                    return (
                        <div
                            key={spell.slug}
                            className={cn(
                                "flex flex-col gap-2 rounded-xl border p-3 transition-colors",
                                isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card",
                                selectDisabled && "opacity-60"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <button
                                    type="button"
                                    className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
                                    aria-pressed={isSelected}
                                    disabled={selectDisabled}
                                    onClick={() =>
                                        togglePreparedSpell(form, spell.slug, {
                                            quota,
                                        })
                                    }
                                >
                                    <span className="font-serif font-semibold leading-tight">
                                        {spell.name}
                                    </span>
                                    {spell.shortDescription ? (
                                        <span
                                            className={cn(
                                                "mt-1 block text-xs leading-snug",
                                                isSelected
                                                    ? "text-primary-foreground/80"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {spell.shortDescription}
                                        </span>
                                    ) : null}
                                </button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="size-8 shrink-0"
                                    aria-label={t("selection.expandDetails")}
                                    onClick={() => openSpellDetail(spell.slug)}
                                >
                                    <Maximize2
                                        className="size-4"
                                        aria-hidden
                                    />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

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
        </div>
    );
}
