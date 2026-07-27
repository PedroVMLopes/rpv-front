"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale, ModifierSource } from "@rpv/domain";
import type { Grant } from "@rpv/content";
import { matchesGrantSourceTypes } from "@/lib/character/creationSteps/stepFilters";
import type { CreationStepSourceFilter } from "@/lib/character/creationSteps/creationStep.types";
import { filterChoicesForStep } from "@/lib/character/creationSteps/stepFilters";
import {
    getFixedLanguageGrants,
    getFixedRefsForGrantType,
    getLanguageBudget,
} from "@/lib/character/characterGrants";
import {
    collectLanguageChoiceGrants,
    collectNonLanguageChoiceGrants,
    collectPendingChoiceGrants,
    type PendingChoiceGrant,
} from "@/lib/character/grantChoices";
import { getOtherPickedRefsForGrantType } from "@/lib/character/grantChoiceOptions";
import {
    groupChoicesByPool,
    readPoolSelectedRefs,
    toggleRefInPool,
    type GrantChoicePool,
} from "@/lib/character/grantChoicePool";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { findInvalidGrantPicks } from "@/lib/character/choiceValidation";
import type {
    CharacterChoices,
    CharacterSelections,
} from "@/lib/character/storedCharacter";
import { readLevelFromForm } from "@/lib/character/level";
import type { SystemKey } from "@/presets";
import { PressableSelectionCard } from "@/components/characters/creation/PressableSelectionCard";
import { cn } from "@/lib/utils";

type CharacterGrantPickersProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    sourceTypes?: Array<ModifierSource["type"]>;
    stepFilter?: CreationStepSourceFilter;
    sections?: "all" | "choices-only";
    displayLevel?: number;
    focusKey?: string;
};

function readGrantPicks(
    form: UseFormReturn<Record<string, unknown>>
): Record<string, string> {
    const choices = form.watch("choices") as CharacterChoices | undefined;
    return choices?.grantPicks ?? {};
}

function buildOwnedRefsByGrantType(
    selections: CharacterSelections,
    contentLocale: Locale,
    characterLevel: number,
    pending: ReturnType<typeof collectPendingChoiceGrants>
): Map<Grant["grantType"], Set<string>> {
    const grantTypes = new Set(pending.map((choice) => choice.grant.grantType));
    const owned = new Map<Grant["grantType"], Set<string>>();

    for (const grantType of grantTypes) {
        owned.set(
            grantType,
            getFixedRefsForGrantType(
                selections,
                contentLocale,
                grantType,
                characterLevel
            )
        );
    }

    return owned;
}

function resolvePoolFocusKey(
    pool: GrantChoicePool,
    focusKey: string | undefined
): string {
    if (focusKey && pool.slots.some((slot) => slot.key === focusKey)) {
        return focusKey;
    }

    return pool.slots[0]?.key ?? pool.poolKey;
}

export function CharacterGrantPickers({
    form,
    contentLocale,
    system,
    sourceTypes,
    stepFilter,
    sections = "all",
    displayLevel,
    focusKey,
}: CharacterGrantPickersProps) {
    const t = useTranslations("grants");
    const tAbilities = useTranslations("abilities");
    const formValues = form.watch();

    const characterLevel = useMemo(
        () => displayLevel ?? readLevelFromForm(formValues),
        [displayLevel, formValues]
    );

    const selections = useMemo(
        () => buildSelectionsFromForm(formValues),
        [formValues]
    );

    const allPendingChoices = useMemo(
        () =>
            collectPendingChoiceGrants(
                selections,
                contentLocale,
                characterLevel,
                system
            ),
        [selections, contentLocale, characterLevel, system]
    );

    const pendingChoices = useMemo(() => {
        const filtered = allPendingChoices.filter((choice) =>
            matchesGrantSourceTypes(choice.source, sourceTypes)
        );

        return filterChoicesForStep(filtered, stepFilter);
    }, [allPendingChoices, sourceTypes, stepFilter]);

    const ownedRefsByGrantType = useMemo(
        () =>
            buildOwnedRefsByGrantType(
                selections,
                contentLocale,
                characterLevel,
                pendingChoices
            ),
        [selections, contentLocale, characterLevel, pendingChoices]
    );

    const fixedLanguages = useMemo(
        () =>
            getFixedLanguageGrants(
                selections,
                contentLocale,
                characterLevel
            ).filter((grant) =>
                matchesGrantSourceTypes(grant.source, sourceTypes)
            ),
        [selections, contentLocale, characterLevel, sourceTypes]
    );

    const allLanguageChoices = useMemo(
        () =>
            collectLanguageChoiceGrants(
                selections,
                contentLocale,
                characterLevel,
                system
            ),
        [selections, contentLocale, characterLevel, system]
    );

    const languageChoices = useMemo(() => {
        const filtered = allLanguageChoices.filter((choice) =>
            matchesGrantSourceTypes(choice.source, sourceTypes)
        );

        return filterChoicesForStep(filtered, stepFilter);
    }, [allLanguageChoices, sourceTypes, stepFilter]);

    const nonInventoryChoices = useMemo(() => {
        if (stepFilter) {
            return pendingChoices.filter(
                (choice) =>
                    choice.grant.grantType !== "inventory_item" &&
                    choice.grant.grantType !== "currency"
            );
        }

        return collectNonLanguageChoiceGrants(
            selections,
            contentLocale,
            characterLevel,
            system
        )
            .filter((choice) => choice.grant.grantType !== "inventory_item")
            .filter((choice) =>
                matchesGrantSourceTypes(choice.source, sourceTypes)
            );
    }, [
        stepFilter,
        pendingChoices,
        selections,
        contentLocale,
        characterLevel,
        system,
        sourceTypes,
    ]);

    const racialAsiChoices = useMemo(
        () =>
            nonInventoryChoices.filter(
                (choice) => choice.grant.grantType === "ability_score"
            ),
        [nonInventoryChoices]
    );

    const otherChoices = useMemo(
        () =>
            nonInventoryChoices.filter(
                (choice) => choice.grant.grantType !== "ability_score"
            ),
        [nonInventoryChoices]
    );

    const languagePools = useMemo(
        () => groupChoicesByPool(languageChoices),
        [languageChoices]
    );

    const racialAsiPools = useMemo(
        () => groupChoicesByPool(racialAsiChoices),
        [racialAsiChoices]
    );

    const otherPools = useMemo(
        () => groupChoicesByPool(otherChoices),
        [otherChoices]
    );

    const languageBudget = useMemo(() => {
        if (sourceTypes && sourceTypes.length > 0) {
            return languageChoices.length;
        }

        return getLanguageBudget(selections, contentLocale, characterLevel);
    }, [
        sourceTypes,
        languageChoices.length,
        selections,
        contentLocale,
        characterLevel,
    ]);

    const grantPicks = readGrantPicks(form);
    const choicesError = form.formState.errors.choices;
    const invalidPicks = useMemo(
        () =>
            findInvalidGrantPicks(formValues, contentLocale, system).filter(
                (issue) => {
                    if (!issue.key) {
                        return !sourceTypes || sourceTypes.length === 0;
                    }

                    return matchesGrantSourceTypes(
                        {
                            type: issue.key.split(
                                ":"
                            )[0] as ModifierSource["type"],
                            id: issue.key.split(":")[1] ?? "",
                        },
                        sourceTypes
                    );
                }
            ),
        [formValues, contentLocale, system, sourceTypes]
    );
    const invalidChoiceKeys = useMemo(
        () =>
            new Set(
                invalidPicks
                    .map((issue) => issue.key)
                    .filter((key): key is string => key !== undefined)
            ),
        [invalidPicks]
    );
    const hasInvalidChoices = invalidPicks.length > 0;

    const ownedLanguageRefs =
        ownedRefsByGrantType.get("language") ??
        new Set(fixedLanguages.map((grant) => grant.ref));

    const showLanguages =
        sections === "all" &&
        (fixedLanguages.length > 0 || languageChoices.length > 0);
    const showRacialAsi =
        racialAsiChoices.length > 0 &&
        (sections === "all" ||
            stepFilter?.grantTypes?.includes("ability_score") === true);

    if (!showLanguages && !showRacialAsi && otherChoices.length === 0) {
        return null;
    }

    function renderChoicePool(
        pool: GrantChoicePool,
        {
            pendingForType,
            ownedRefs,
            translateOptionLabel,
        }: {
            pendingForType: PendingChoiceGrant[];
            ownedRefs: Set<string>;
            translateOptionLabel?: (label: string) => string;
        }
    ) {
        const firstSlot = pool.slots[0]!;
        const selectedRefs = readPoolSelectedRefs(grantPicks, pool.slots);
        const selectedSet = new Set(selectedRefs);
        const quota = pool.slots.length;
        const isFull = selectedRefs.length >= quota;
        const poolFocusKey = resolvePoolFocusKey(pool, focusKey);
        const poolFocused =
            focusKey !== undefined &&
            pool.slots.some((slot) => slot.key === focusKey);
        const isInvalid = pool.slots.some((slot) =>
            invalidChoiceKeys.has(slot.key)
        );

        const otherPicked = getOtherPickedRefsForGrantType(
            firstSlot.grant.grantType,
            pendingForType,
            grantPicks,
            firstSlot.key
        );

        for (const ref of selectedRefs) {
            otherPicked.delete(ref);
        }

        return (
            <div
                key={pool.poolKey}
                data-focus-key={poolFocusKey}
                data-pool-key={pool.poolKey}
                className={cn(
                    "flex flex-col gap-2 rounded-md text-sm",
                    poolFocused && "ring-2 ring-primary ring-offset-2",
                    isInvalid && "ring-2 ring-destructive ring-offset-2"
                )}
            >
                <span className="font-medium">{pool.label}</span>
                <div className="flex flex-wrap gap-2">
                    {pool.options.map((option) => {
                        const isSelected = selectedSet.has(option.value);
                        const owned = ownedRefs.has(option.value);
                        const pickedElsewhere = otherPicked.has(option.value);
                        const unavailable =
                            owned || (pickedElsewhere && !isSelected);
                        const disabledByQuota = isFull && !isSelected;
                        const disabled = unavailable || disabledByQuota;
                        const displayLabel = translateOptionLabel
                            ? translateOptionLabel(option.label)
                            : option.label;
                        const label =
                            owned || (pickedElsewhere && !isSelected)
                                ? `✓ ${displayLabel}`
                                : displayLabel;

                        return (
                            <PressableSelectionCard
                                key={option.value}
                                selected={isSelected}
                                disabled={disabled}
                                onClick={() => {
                                    if (disabled) {
                                        return;
                                    }

                                    toggleRefInPool(
                                        form,
                                        pool.slots,
                                        option.value
                                    );
                                }}
                            >
                                <span className="text-sm font-medium">
                                    {label}
                                </span>
                            </PressableSelectionCard>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 border rounded-lg p-4 bg-card text-card-foreground">
            {choicesError && hasInvalidChoices ? (
                <p className="text-sm font-medium text-destructive">
                    {t("choicesIncomplete")}
                </p>
            ) : null}
            {showLanguages && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold">{t("languagesTitle")}</h2>

                    {fixedLanguages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {fixedLanguages.map((grant) => (
                                <span
                                    key={grant.id}
                                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                                >
                                    {grant.name ?? grant.ref}
                                    <span className="ml-1 opacity-60">
                                        ({t("autoKnown")})
                                    </span>
                                </span>
                            ))}
                        </div>
                    )}

                    {languageBudget > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {t("languageBudget", { count: languageBudget })}
                        </p>
                    )}

                    {languagePools.map((pool) =>
                        renderChoicePool(pool, {
                            pendingForType: allLanguageChoices,
                            ownedRefs: ownedLanguageRefs,
                        })
                    )}
                </section>
            )}

            {showRacialAsi && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold">{t("racialAsiTitle")}</h2>
                    {racialAsiPools.map((pool) =>
                        renderChoicePool(pool, {
                            pendingForType: allPendingChoices,
                            ownedRefs:
                                ownedRefsByGrantType.get("ability_score") ??
                                new Set(),
                            translateOptionLabel: (label) => tAbilities(label),
                        })
                    )}
                </section>
            )}

            {otherPools.length > 0 && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold">
                        {t("abilityChoicesTitle")}
                    </h2>
                    {otherPools.map((pool) => {
                        const grantType = pool.slots[0]!.grant.grantType;
                        return renderChoicePool(pool, {
                            pendingForType: allPendingChoices,
                            ownedRefs:
                                ownedRefsByGrantType.get(grantType) ??
                                new Set(),
                        });
                    })}
                </section>
            )}
        </div>
    );
}
