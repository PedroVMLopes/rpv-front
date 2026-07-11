"use client";

import { useMemo, useState } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { getSpell } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { PendingChoiceGrant } from "@/lib/character/grantChoices";
import { getFixedRefsForGrantType } from "@/lib/character/characterGrants";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { readLevelFromForm } from "@/lib/character/level";
import {
    buildGrantChoiceSelectOptions,
    getOtherPickedRefsForGrantType,
} from "@/lib/character/grantChoiceOptions";
import { readGrantPicks, setGrantPick } from "@/lib/character/grantPickForm";
import { buildSpellPickContentModel } from "@/lib/content/buildSpellPickContentModel";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import { Button } from "@/components/ui/button";
import type { SystemKey } from "@/presets";
import { cn } from "@/lib/utils";

type SpellChoiceGridProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    choices: PendingChoiceGrant[];
};

export function SpellChoiceGrid({
    form,
    contentLocale,
    system,
    choices,
}: SpellChoiceGridProps) {
    const t = useTranslations("characterCreation");
    const tSpells = useTranslations("spells");
    const tAbilities = useTranslations("abilities");
    const tContentDetail = useTranslations("contentDetail");

    const formValues = form.watch();
    const grantPicks = readGrantPicks(form);

    const selections = useMemo(
        () => buildSelectionsFromForm(formValues),
        [formValues]
    );

    const characterLevel = useMemo(
        () => readLevelFromForm(formValues),
        [formValues]
    );

    const ownedRefs = useMemo(
        () =>
            getFixedRefsForGrantType(
                selections,
                contentLocale,
                "spell",
                characterLevel
            ),
        [selections, contentLocale, characterLevel]
    );

    const [detailModel, setDetailModel] = useState<ContentDetailModel | null>(
        null
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

    return (
        <div className="flex flex-col gap-6">
            {choices.map((choice) => {
                const selected = grantPicks[choice.key] ?? "";
                const otherPicked = getOtherPickedRefsForGrantType(
                    "spell",
                    choices,
                    grantPicks,
                    choice.key
                );
                const options = buildGrantChoiceSelectOptions(
                    choice,
                    grantPicks,
                    ownedRefs,
                    otherPicked
                );

                return (
                    <section key={choice.key} className="flex flex-col gap-3">
                        <h3 className="text-sm font-bold">{choice.label}</h3>
                        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                            {options.map((option) => {
                                const isSelected = option.value === selected;

                                return (
                                    <div
                                        key={`${choice.key}-${option.value}`}
                                        className={cn(
                                            "flex flex-col gap-2 rounded-xl border p-3 transition-colors",
                                            isSelected
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border bg-card",
                                            option.disabled &&
                                                !isSelected &&
                                                "opacity-50"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <button
                                                type="button"
                                                disabled={
                                                    option.disabled && !isSelected
                                                }
                                                className="min-w-0 flex-1 text-left"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setGrantPick(
                                                            form,
                                                            choice.key,
                                                            ""
                                                        );
                                                        return;
                                                    }

                                                    if (option.disabled) {
                                                        return;
                                                    }

                                                    setGrantPick(
                                                        form,
                                                        choice.key,
                                                        option.value
                                                    );
                                                }}
                                            >
                                                <span className="font-serif font-semibold leading-tight">
                                                    {option.label}
                                                </span>
                                            </button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="size-8 shrink-0"
                                                aria-label={t(
                                                    "selection.expandDetails"
                                                )}
                                                onClick={() =>
                                                    openSpellDetail(option.value)
                                                }
                                            >
                                                <Maximize2
                                                    className="size-4"
                                                    aria-hidden
                                                />
                                            </Button>
                                        </div>
                                        <span
                                            className={cn(
                                                "text-xs",
                                                isSelected
                                                    ? "text-primary-foreground/80"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {isSelected
                                                ? t("spellPick.selected")
                                                : option.disabled
                                                  ? t("spellPick.unavailable")
                                                  : t("spellPick.available")}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                );
            })}

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
