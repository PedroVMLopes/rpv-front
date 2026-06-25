"use client";

import { useEffect, useMemo, useRef } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type {
    AbilityGenerationConfig,
    AbilityScoreMethod,
    PresetAbilityAttribute,
    PresetStatConfig,
} from "@/presets/types";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { readLevelFromForm } from "@/lib/character/level";
import { deriveRaceModifiers } from "@/lib/character/raceModifiers";
import {
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AbilityScoresFieldProps = {
    form: UseFormReturn<Record<string, unknown>>;
    abilities: PresetAbilityAttribute[];
    statConfig: Pick<PresetStatConfig, "defaultAbilityValue" | "abilityGeneration">;
    contentLocale: Locale;
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

export function AbilityScoresField({
    form,
    abilities,
    statConfig,
    contentLocale,
}: AbilityScoresFieldProps) {
    const t = useTranslations("abilityScores");
    const tAbilities = useTranslations("abilities");
    const config = statConfig.abilityGeneration;

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
        defaultAbilityScoreMethodForLevel(level)) as AbilityScoreMethod;
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
        const initialMethod =
            storedMethod ?? defaultAbilityScoreMethodForLevel(currentLevel);

        if (!storedMethod) {
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
    }, [abilities, form, statConfig]);

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

        writeAttributes(form, getMethodDefaults(method, abilities, statConfig));

        if (method !== "roll") {
            form.setValue("abilityScoreRolls", undefined, { shouldDirty: true });
        }

        previousMethodRef.current = method;
    }, [abilities, form, method, statConfig]);

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

    const usedStandardValues = new Set(
        attributeValues.filter((value) => value !== UNASSIGNED_ABILITY_VALUE)
    );

    const usedRollValues = countPoolUsage(attributeValues, rolls);

    function handleRoll() {
        const pool = rollAbilityPool(config);
        form.setValue("abilityScoreRolls", pool, {
            shouldDirty: true,
            shouldValidate: true,
        });
        writeAttributes(
            form,
            getMethodDefaults("roll", abilities, statConfig)
        );
    }

    function canIncreasePointBuy(index: number): boolean {
        const current = attributeValues[index];
        const next = current + 1;
        if (next > config.pointBuy.max) {
            return false;
        }

        const nextValues = attributeValues.map((value, valueIndex) =>
            valueIndex === index ? next : value
        );

        return pointBuyRemaining(nextValues, config.pointBuy) >= 0;
    }

    function canDecreasePointBuy(index: number): boolean {
        return attributeValues[index] > config.pointBuy.min;
    }

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold">{t("title")}</label>
                <select
                    className="bg-background rounded border px-2 py-1 text-sm"
                    value={method}
                    onChange={(event) => {
                        userChangedMethodRef.current = true;
                        form.setValue(
                            "abilityScoreMethod",
                            event.target.value as AbilityScoreMethod,
                            { shouldDirty: true, shouldValidate: true }
                        );
                    }}
                >
                    {config.methods.map((entry) => (
                        <option key={entry} value={entry}>
                            {t(`methods.${entry}`)}
                        </option>
                    ))}
                </select>
            </div>

            {method === "point-buy" && remainingPoints !== null && (
                <p className="text-xs text-muted-foreground">
                    {t("pointsRemaining", { count: remainingPoints })}
                </p>
            )}

            {method === "roll" && (
                <Button type="button" variant="outline" onClick={handleRoll}>
                    {t("roll")}
                </Button>
            )}

            {shouldShowMigrationHint(level, method) && (
                <p className="text-xs text-muted-foreground">{t("migrationHint")}</p>
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
                            className="flex flex-col gap-2 rounded border p-3 bg-background"
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
                                <select
                                    className="bg-background rounded border px-2 py-1 text-sm"
                                    value={
                                        value === UNASSIGNED_ABILITY_VALUE
                                            ? ""
                                            : String(value)
                                    }
                                    onChange={(event) =>
                                        setAttributeValue(
                                            form,
                                            abilities,
                                            index,
                                            event.target.value === ""
                                                ? UNASSIGNED_ABILITY_VALUE
                                                : Number(event.target.value)
                                        )
                                    }
                                >
                                    <option value="">{t("assignScore")}</option>
                                    {getStandardArrayOptions(
                                        config.standardArray,
                                        value,
                                        usedStandardValues
                                    ).map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
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

                            {method === "roll" && (
                                <select
                                    className="bg-background rounded border px-2 py-1 text-sm"
                                    value={
                                        value === UNASSIGNED_ABILITY_VALUE
                                            ? ""
                                            : String(value)
                                    }
                                    disabled={rolls.length === 0}
                                    onChange={(event) =>
                                        setAttributeValue(
                                            form,
                                            abilities,
                                            index,
                                            event.target.value === ""
                                                ? UNASSIGNED_ABILITY_VALUE
                                                : Number(event.target.value)
                                        )
                                    }
                                >
                                    <option value="">{t("assignScore")}</option>
                                    {getRollOptions(
                                        rolls,
                                        value,
                                        usedRollValues
                                    ).map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
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

function countPoolUsage(values: number[], pool: number[]): Map<number, number> {
    const usage = new Map<number, number>();
    for (const value of values) {
        if (value === UNASSIGNED_ABILITY_VALUE) {
            continue;
        }
        usage.set(value, (usage.get(value) ?? 0) + 1);
    }

    const poolCounts = new Map<number, number>();
    for (const value of pool) {
        poolCounts.set(value, (poolCounts.get(value) ?? 0) + 1);
    }

    return usage;
}

function getStandardArrayOptions(
    standardArray: number[],
    selected: number,
    usedValues: Set<number>
): number[] {
    const options = new Set<number>();

    if (selected !== UNASSIGNED_ABILITY_VALUE) {
        options.add(selected);
    }

    for (const value of standardArray) {
        if (!usedValues.has(value)) {
            options.add(value);
        }
    }

    return [...options].sort((a, b) => b - a);
}

function getRollOptions(
    pool: number[],
    selected: number,
    usedCounts: Map<number, number>
): number[] {
    const poolCounts = new Map<number, number>();
    for (const value of pool) {
        poolCounts.set(value, (poolCounts.get(value) ?? 0) + 1);
    }

    const options = new Set<number>();

    if (selected !== UNASSIGNED_ABILITY_VALUE) {
        options.add(selected);
    }

    for (const [value, poolCount] of poolCounts) {
        const used = usedCounts.get(value) ?? 0;
        const selectedCount = selected === value ? 1 : 0;
        if (used - selectedCount < poolCount) {
            options.add(value);
        }
    }

    return [...options].sort((a, b) => b - a);
}
