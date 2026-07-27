"use client";

import { useMemo, useState } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { getSpell } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import {
    collectPendingChoiceGrants,
    type PendingChoiceGrant,
} from "@/lib/character/grantChoices";
import { getFixedRefsForGrantType } from "@/lib/character/characterGrants";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { readLevelFromForm } from "@/lib/character/level";
import { getOtherPickedRefsForGrantType } from "@/lib/character/grantChoiceOptions";
import { readGrantPicks } from "@/lib/character/grantPickForm";
import {
    bucketOptionsBySpellLevel,
    groupSpellChoicesByPool,
    readPoolSelectedRefs,
    toggleSpellInPool,
} from "@/lib/character/spellPoolPicks";
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
    focusKey?: string;
};

export function SpellChoiceGrid({
    form,
    contentLocale,
    system,
    choices,
    focusKey,
}: SpellChoiceGridProps) {
    const t = useTranslations("characterCreation");
    const tSpellPicks = useTranslations("characterCreation.spellPicks");
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

    const allSpellChoices = useMemo(
        () =>
            collectPendingChoiceGrants(
                selections,
                contentLocale,
                characterLevel,
                system
            ).filter((choice) => choice.grant.grantType === "spell"),
        [selections, contentLocale, characterLevel, system]
    );

    const pools = useMemo(() => groupSpellChoicesByPool(choices), [choices]);

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

    function levelHeading(levelInt: number): string {
        if (levelInt === 0) {
            return tSpellPicks("levelCantrip");
        }

        if (levelInt < 0) {
            return tSpellPicks("levelUnknown");
        }

        return tSpellPicks("levelN", { level: levelInt });
    }

    return (
        <div className="flex flex-col gap-6">
            {pools.map((pool) => {
                const selectedRefs = readPoolSelectedRefs(grantPicks, pool.slots);
                const selectedSet = new Set(selectedRefs);
                const quota = pool.slots.length;
                const isFull = selectedRefs.length >= quota;
                const poolFocused =
                    focusKey !== undefined &&
                    pool.slots.some((slot) => slot.key === focusKey);

                const otherPicked = getOtherPickedRefsForGrantType(
                    "spell",
                    allSpellChoices,
                    grantPicks,
                    pool.slots[0]!.key
                );

                for (const ref of selectedRefs) {
                    otherPicked.delete(ref);
                }

                const levelBuckets = bucketOptionsBySpellLevel(
                    pool.options,
                    contentLocale
                );

                return (
                    <section
                        key={pool.poolKey}
                        data-focus-key={pool.slots[0]?.key}
                        data-pool-key={pool.poolKey}
                        className={cn(
                            "flex flex-col gap-4 rounded-lg",
                            poolFocused && "ring-2 ring-primary ring-offset-2"
                        )}
                    >
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-bold">{pool.label}</h3>
                            <p className="text-sm text-muted-foreground">
                                {tSpellPicks("count", {
                                    selected: selectedRefs.length,
                                    quota,
                                })}
                            </p>
                        </div>

                        {levelBuckets.map((bucket) => (
                            <div
                                key={`${pool.poolKey}-${bucket.levelInt}`}
                                className="flex flex-col gap-3"
                            >
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {levelHeading(bucket.levelInt)}
                                </h4>
                                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                                    {bucket.options.map((option) => {
                                        const isSelected = selectedSet.has(
                                            option.value
                                        );
                                        const owned = ownedRefs.has(
                                            option.value
                                        );
                                        const pickedElsewhere =
                                            otherPicked.has(option.value);
                                        const unavailable =
                                            owned ||
                                            (pickedElsewhere && !isSelected);
                                        const disabledByQuota =
                                            isFull && !isSelected;
                                        const disabled =
                                            unavailable || disabledByQuota;
                                        const catalogEntry = getSpell(
                                            option.value,
                                            contentLocale
                                        );
                                        const shortDescription =
                                            catalogEntry?.shortDescription.trim();

                                        return (
                                            <div
                                                key={`${pool.poolKey}-${option.value}`}
                                                className={cn(
                                                    "flex flex-col gap-2 rounded-xl border-custom p-3 transition-colors",
                                                    isSelected
                                                        ? "ring-1 bg-card text-card-foreground"
                                                        : "border-border bg-accent text-accent-foreground",
                                                    disabled &&
                                                        !isSelected &&
                                                        "opacity-40"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={disabled}
                                                        className="min-w-0 flex-1 text-left"
                                                        aria-pressed={isSelected}
                                                        onClick={() => {
                                                            if (disabled) {
                                                                return;
                                                            }

                                                            toggleSpellInPool(
                                                                form,
                                                                pool.slots,
                                                                option.value
                                                            );
                                                        }}
                                                    >
                                                        <span className="font-serif font-semibold leading-tight">
                                                            {owned ||
                                                            (pickedElsewhere &&
                                                                !isSelected)
                                                                ? `✓ ${option.label}`
                                                                : option.label}
                                                        </span>
                                                        {shortDescription ? (
                                                            <span className="mt-1 block text-xs leading-snug opacity-80">
                                                                {
                                                                    shortDescription
                                                                }
                                                            </span>
                                                        ) : null}
                                                    </button>
                                                    <Button
                                                        type="button"
                                                        variant="link"
                                                        size="icon"
                                                        className="size-8 shrink-0 hover:text-primary hover:cursor-pointer"
                                                        aria-label={t(
                                                            "selection.expandDetails"
                                                        )}
                                                        onClick={() =>
                                                            openSpellDetail(
                                                                option.value
                                                            )
                                                        }
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
                            </div>
                        ))}
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
