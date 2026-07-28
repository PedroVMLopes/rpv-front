"use client";

import { useEffect, useMemo, useRef } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type {
    AbilityScoreMethod,
    PresetAbilityAttribute,
    PresetStatConfig,
} from "@/presets/types";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { readLevelFromForm } from "@/lib/character/level";
import { deriveRaceModifiers } from "@/lib/character/raceModifiers";
import {
    assignStandardArrayScore,
    assignRollScore,
    defaultAbilityScoreMethodForLevel,
    getMethodDefaults,
    pointBuyCost,
    pointBuyRemaining,
    readAttributeValues,
    rollAbilityPool,
    shouldShowMigrationHint,
    UNASSIGNED_ABILITY_VALUE,
    type AttributeEntry,
} from "@/lib/character/abilityScoreGeneration";
import type { PlayerFormMode } from "@/lib/character/characterCreationSteps";
import { PressableSelectionCard } from "@/components/characters/creation/PressableSelectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AbilityScoresFieldProps = {
    form: UseFormReturn<Record<string, unknown>>;
    abilities: PresetAbilityAttribute[];
    statConfig: Pick<PresetStatConfig, "defaultAbilityValue" | "abilityGeneration">;
    contentLocale: Locale;
    mode?: PlayerFormMode;
};

function getAttributes(
    form: UseFormReturn<Record<string, unknown>>
): AttributeEntry[] {
    return (form.getValues("attributes") as AttributeEntry[] | undefined) ?? [];
}

function writeAttributes(
    form: UseFormReturn<Record<string, unknown>>,
    attributes: AttributeEntry[]
) {
    form.setValue("attributes", attributes, {
        shouldDirty: true,
        shouldValidate: true,
    });
}

function setAttributeValue(
    form: UseFormReturn<Record<string, unknown>>,
    abilities: PresetAbilityAttribute[],
    index: number,
    value: number
) {
    const current = getAttributes(form);
    const next = abilities.map((ability, abilityIndex) => ({
        name: ability.name,
        value:
            abilityIndex === index
                ? value
                : (current[abilityIndex]?.value ?? UNASSIGNED_ABILITY_VALUE),
    }));
    writeAttributes(form, next);
}

function writeAttributeValues(
    form: UseFormReturn<Record<string, unknown>>,
    abilities: PresetAbilityAttribute[],
    values: number[]
) {
    writeAttributes(
        form,
        abilities.map((ability, abilityIndex) => ({
            name: ability.name,
            value: values[abilityIndex] ?? UNASSIGNED_ABILITY_VALUE,
        }))
    );
}

export function AbilityScoresField({
    form,
    abilities,
    statConfig,
    contentLocale,
    mode = "create",
}: AbilityScoresFieldProps) {
    const t = useTranslations("abilityScores");
    const tAbilities = useTranslations("abilities");
    const config = statConfig.abilityGeneration;
    const forceManualOnInit = mode === "edit" || mode === "level-up";

    const { control } = form;

    const attributes = useWatch({
        control,
        name: "attributes",
    }) as AttributeEntry[] | undefined;
    const race = useWatch({ control, name: "race" });
    const subrace = useWatch({ control, name: "subrace" });
    const choices = useWatch({ control, name: "choices" });
    const watchedLevel = useWatch({ control, name: "level" });
    const level = readLevelFromForm({ level: watchedLevel });
    const watchedMethod = useWatch({
        control,
        name: "abilityScoreMethod",
    });
    const method = (watchedMethod ??
        (forceManualOnInit
            ? "manual"
            : defaultAbilityScoreMethodForLevel(level))) as AbilityScoreMethod;
    const rolls = (useWatch({ control, name: "abilityScoreRolls" }) ??
        []) as number[];

    const previousMethodRef = useRef<AbilityScoreMethod>(method);
    const previousLevelRef = useRef<number | undefined>(undefined);
    const userChangedMethodRef = useRef(false);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) {
            return;
        }

        initializedRef.current = true;

        const currentLevel = readLevelFromForm(form.getValues());
        const storedMethod = form.getValues("abilityScoreMethod") as
            | AbilityScoreMethod
            | undefined;
        const initialMethod: AbilityScoreMethod = forceManualOnInit
            ? "manual"
            : (storedMethod ?? defaultAbilityScoreMethodForLevel(currentLevel));

        if (forceManualOnInit || !storedMethod) {
            form.setValue("abilityScoreMethod", initialMethod, {
                shouldDirty: false,
            });
        }

        previousMethodRef.current = initialMethod;
        previousLevelRef.current = currentLevel;

        const currentAttributes = form.getValues("attributes") as
            | AttributeEntry[]
            | undefined;

        if (!currentAttributes || currentAttributes.length === 0) {
            writeAttributes(
                form,
                getMethodDefaults(initialMethod, abilities, statConfig)
            );
        }
    }, [abilities, forceManualOnInit, form, statConfig]);

    useEffect(() => {
        if (previousLevelRef.current === undefined) {
            previousLevelRef.current = level;
            return;
        }

        if (previousLevelRef.current === level || userChangedMethodRef.current) {
            previousLevelRef.current = level;
            return;
        }

        previousLevelRef.current = level;
        const nextMethod = defaultAbilityScoreMethodForLevel(level);
        form.setValue("abilityScoreMethod", nextMethod, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [form, level]);

    useEffect(() => {
        if (previousMethodRef.current === method) {
            return;
        }

        // Preserve filled scores when switching methods; only clear roll pool.
        if (method !== "roll") {
            form.setValue("abilityScoreRolls", undefined, { shouldDirty: true });
        }

        previousMethodRef.current = method;
    }, [form, method]);

    const attributeValues = useMemo(
        () => readAttributeValues(attributes, abilities),
        [attributes, abilities]
    );

    const remainingPoints = useMemo(() => {
        if (!config || method !== "point-buy") {
            return null;
        }

        return pointBuyRemaining(attributeValues, config.pointBuy);
    }, [attributeValues, config, method]);

    const raceModifiers = useMemo(() => {
        const selections = buildSelectionsFromForm({ race, subrace, choices });
        return deriveRaceModifiers(selections, contentLocale);
    }, [race, subrace, choices, contentLocale]);

    const raceBonusByStat = useMemo(() => {
        const bonuses = new Map<string, number>();
        for (const modifier of raceModifiers) {
            if (modifier.operation !== "add") {
                continue;
            }
            bonuses.set(
                modifier.stat,
                (bonuses.get(modifier.stat) ?? 0) + modifier.value
            );
        }
        return bonuses;
    }, [raceModifiers]);

    const attributesError = form.formState.errors.attributes;

    if (!config) {
        return null;
    }

    const abilityGeneration = config;

    function handleRoll() {
        const pool = rollAbilityPool(abilityGeneration);
        form.setValue("abilityScoreRolls", pool, {
            shouldDirty: true,
            shouldValidate: true,
        });
        writeAttributes(
            form,
            getMethodDefaults("roll", abilities, statConfig)
        );
    }

    function applyScorePick(index: number, option: number) {
        const nextValues = assignStandardArrayScore(
            attributeValues,
            index,
            option
        );
        writeAttributeValues(form, abilities, nextValues);
    }

    function applyRollPick(index: number, option: number) {
        const nextValues = assignRollScore(
            attributeValues,
            index,
            option,
            rolls
        );
        writeAttributeValues(form, abilities, nextValues);
    }

    function canIncreasePointBuy(index: number): boolean {
        const current = attributeValues[index];
        const next = current + 1;
        if (next > abilityGeneration.pointBuy.max) {
            return false;
        }

        const nextValues = attributeValues.map((value, valueIndex) =>
            valueIndex === index ? next : value
        );

        return pointBuyRemaining(nextValues, abilityGeneration.pointBuy) >= 0;
    }

    function canDecreasePointBuy(index: number): boolean {
        return attributeValues[index] > abilityGeneration.pointBuy.min;
    }

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-card text-card-foreground">
            <div className="flex flex-col gap-2">
                <span className="text-sm font-bold">{t("title")}</span>
                <div className="flex flex-wrap gap-2">
                    {config.methods.map((entry) => (
                        <PressableSelectionCard
                            key={entry}
                            selected={method === entry}
                            onClick={() => {
                                userChangedMethodRef.current = true;
                                form.setValue(
                                    "abilityScoreMethod",
                                    entry as AbilityScoreMethod,
                                    { shouldDirty: true, shouldValidate: true }
                                );
                            }}
                        >
                            <span className="text-sm font-medium">
                                {t(`methods.${entry}`)}
                            </span>
                        </PressableSelectionCard>
                    ))}
                </div>
            </div>

            {method === "point-buy" && remainingPoints !== null && (
                <p className="text-xs">
                    {t("pointsRemaining", { count: remainingPoints })}
                </p>
            )}

            {method === "roll" && (
                <div className="space-y-2">
                    <p className="text-sm">{t("rollHint")}</p>
                    <Button type="button" variant="secondary" className="border-2" onClick={handleRoll}>
                        {t("roll")}
                    </Button>
                </div>
            )}

            {shouldShowMigrationHint(level, method) && (
                <p className="text-xs">{t("migrationHint")}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {abilities.map((ability, index) => {
                    const value = attributeValues[index] ?? UNASSIGNED_ABILITY_VALUE;
                    const raceBonus = raceBonusByStat.get(ability.statKey) ?? 0;
                    const total =
                        value === UNASSIGNED_ABILITY_VALUE
                            ? null
                            : value + raceBonus;

                    return (
                        <div
                            key={ability.name}
                            className={cn("flex flex-col gap-2 rounded border p-3 bg-popover text-popover-foreground border-custom rounded-xl")}
                        >
                            <span className="text-sm font-semibold">
                                {ability.labelKey
                                    ? tAbilities(ability.name)
                                    : ability.label ?? ability.name}
                            </span>

                            {method === "manual" && (
                                <Input
                                    type="number"
                                    min={0}
                                    max={20}
                                    value={value === UNASSIGNED_ABILITY_VALUE ? "" : value}
                                    className="font-bold border-2"
                                    onChange={(event) => {
                                        const nextValue = event.target.value;
                                        setAttributeValue(
                                            form,
                                            abilities,
                                            index,
                                            nextValue === ""
                                                ? UNASSIGNED_ABILITY_VALUE
                                                : Number(nextValue)
                                        );
                                    }}
                                />
                            )}

                            {method === "standard-array" && (
                                <div className="flex flex-wrap gap-1">
                                    {config.standardArray.map((option) => {
                                        const selected = value === option;
                                        const takenElsewhere =
                                            !selected &&
                                            attributeValues.some(
                                                (assigned, assignedIndex) =>
                                                    assignedIndex !== index &&
                                                    assigned === option
                                            );

                                        return (
                                            <Button
                                                key={option}
                                                type="button"
                                                size="sm"
                                                variant={
                                                    selected
                                                        ? "default"
                                                        : "outline"
                                                }
                                                aria-pressed={selected}
                                                className={cn(
                                                    "border-2",
                                                    takenElsewhere &&
                                                        "opacity-50"
                                                )}
                                                onClick={() =>
                                                    applyScorePick(index, option)
                                                }
                                            >
                                                {option}
                                            </Button>
                                        );
                                    })}
                                </div>
                            )}

                            {method === "point-buy" && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={!canDecreasePointBuy(index)}
                                        onClick={() =>
                                            setAttributeValue(
                                                form,
                                                abilities,
                                                index,
                                                value - 1
                                            )
                                        }
                                    >
                                        -
                                    </Button>
                                    <span className="min-w-8 text-center font-semibold">
                                        {value}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={!canIncreasePointBuy(index)}
                                        onClick={() =>
                                            setAttributeValue(
                                                form,
                                                abilities,
                                                index,
                                                value + 1
                                            )
                                        }
                                    >
                                        +
                                    </Button>
                                    <span className="text-xs text-muted-foreground">
                                        ({pointBuyCost(value, config.pointBuy)} {t("points")})
                                    </span>
                                </div>
                            )}

                            {method === "roll" && rolls.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {rolls.map((option, poolIndex) => {
                                        const { selected, taken } =
                                            getRollButtonState(
                                                rolls,
                                                attributeValues,
                                                index,
                                                poolIndex
                                            );

                                        return (
                                            <Button
                                                key={poolIndex}
                                                type="button"
                                                size="sm"
                                                variant={
                                                    selected
                                                        ? "default"
                                                        : "outline"
                                                }
                                                aria-pressed={selected}
                                                className={cn(
                                                    "border-2",
                                                    taken && "opacity-50"
                                                )}
                                                onClick={() =>
                                                    applyRollPick(index, option)
                                                }
                                            >
                                                {option}
                                            </Button>
                                        );
                                    })}
                                </div>
                            )}

                            {value !== UNASSIGNED_ABILITY_VALUE && (
                                <div
                                    className={`grid gap-2 text-xs text-muted-foreground ${
                                        [
                                            value !== statConfig.defaultAbilityValue,
                                            raceBonus !== 0,
                                            true,
                                        ].filter(Boolean).length === 1
                                            ? "grid-cols-1"
                                            : [
                                                    value !==
                                                        statConfig.defaultAbilityValue,
                                                    raceBonus !== 0,
                                                ].filter(Boolean).length === 2
                                              ? "grid-cols-2"
                                              : "grid-cols-3"
                                    }`}
                                >
                                    {value !== statConfig.defaultAbilityValue && (
                                        <span>{t("columns.base", { value })}</span>
                                    )}
                                    {raceBonus !== 0 && (
                                        <span>
                                            {t("columns.racial", {
                                                mod: raceBonus,
                                            })}
                                        </span>
                                    )}
                                    <span className="font-medium text-foreground">
                                        {t("columns.total", { total: total ?? value })}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {attributesError && (
                <p className="text-sm font-medium text-destructive">
                    {t(`errors.${String(attributesError.message)}`)}
                </p>
            )}
        </div>
    );
}

/**
 * Maps a pool-slot button to selected/taken using multiplicity.
 * Same-value slots are ordered by pool index: others consume first, then this ability.
 */
function getRollButtonState(
    pool: number[],
    attributeValues: number[],
    abilityIndex: number,
    poolIndex: number
): { selected: boolean; taken: boolean } {
    const option = pool[poolIndex];
    if (option === undefined) {
        return { selected: false, taken: false };
    }

    const sameValueIndices = pool.flatMap((value, index) =>
        value === option ? [index] : []
    );
    const rank = sameValueIndices.indexOf(poolIndex);
    const usedByOthers = attributeValues.filter(
        (value, index) => index !== abilityIndex && value === option
    ).length;
    const selectedHere = attributeValues[abilityIndex] === option;

    if (rank < usedByOthers) {
        return { selected: false, taken: true };
    }

    if (selectedHere && rank === usedByOthers) {
        return { selected: true, taken: false };
    }

    return { selected: false, taken: false };
}
