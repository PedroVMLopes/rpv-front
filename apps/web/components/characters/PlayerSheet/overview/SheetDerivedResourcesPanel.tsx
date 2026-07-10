"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { contentRepo } from "@/lib/content/contentRepository";
import {
    computeSpellAttackBonus,
    computeSpellSaveDc,
} from "@/lib/character/combatModifiers";
import { parseDerivedResources } from "@/lib/character/deriveResourcesFromForm";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import { formatModifier } from "@/lib/character/skillModifiers";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { cn } from "@/lib/utils";
import { sheetInset } from "../playerSheetSurfaces";

type UsedSlotsByKey = Record<string, Set<number>>;

function toggleSlot(
    index: number,
    total: number,
    used: Set<number>
): Set<number> {
    if (used.has(index)) {
        const next = new Set(used);
        next.delete(index);
        return next;
    }

    for (let i = total - 1; i >= 0; i--) {
        if (!used.has(i)) {
            return new Set([...used, i]);
        }
    }

    return used;
}

function ResourceSquareButton({
    isUsed,
    ariaLabel,
    onClick,
}: {
    isUsed: boolean;
    ariaLabel: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={isUsed}
            aria-label={ariaLabel}
            onClick={onClick}
            className={cn(
                "size-6 shrink-0 rounded-sm border border-primary bg-primary transition-opacity",
                isUsed && "opacity-25"
            )}
        />
    );
}

function ResourceSquareRow({
    rowKey,
    label,
    count,
    usedIndices,
    onToggle,
    slotAriaLabel,
}: {
    rowKey: string;
    label: string;
    count: number;
    usedIndices: Set<number>;
    onToggle: (index: number) => void;
    slotAriaLabel: (index: number, total: number, isUsed: boolean) => string;
}) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-20 shrink-0 text-xs font-semibold text-muted-foreground">
                {label}
            </span>
            <div className="flex flex-wrap gap-1">
                {Array.from({ length: count }, (_, index) => {
                    const isUsed = usedIndices.has(index);

                    return (
                        <ResourceSquareButton
                            key={`${rowKey}:${index}`}
                            isUsed={isUsed}
                            ariaLabel={slotAriaLabel(index + 1, count, isUsed)}
                            onClick={() => onToggle(index)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function CastingStatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-row items-baseline justify-between gap-4 text-xs">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-bold uppercase tabular-nums">{value}</dd>
        </div>
    );
}

function CastingStatsBlock({
    className,
    classLabel,
    abilityLabel,
    saveDcLabel,
    attackLabel,
    classNameValue,
    abilityValue,
    saveDcValue,
    attackValue,
}: {
    className?: string;
    classLabel: string;
    abilityLabel: string;
    saveDcLabel: string;
    attackLabel: string;
    classNameValue: string;
    abilityValue: string;
    saveDcValue: number | null;
    attackValue: string | null;
}) {
    return (
        <dl className={cn("flex flex-col gap-1.5", className)}>
            <CastingStatRow label={classLabel} value={classNameValue} />
            <CastingStatRow label={abilityLabel} value={abilityValue} />
            {saveDcValue !== null ? (
                <CastingStatRow
                    label={saveDcLabel}
                    value={String(saveDcValue)}
                />
            ) : null}
            {attackValue !== null ? (
                <CastingStatRow label={attackLabel} value={attackValue} />
            ) : null}
        </dl>
    );
}

type SheetDerivedResourcesPanelProps = {
    stored: StoredCharacter;
};

export function SheetDerivedResourcesPanel({
    stored,
}: SheetDerivedResourcesPanelProps) {
    const t = useTranslations("playerSheet");
    const tAbilities = useTranslations("abilities");
    const tResources = useTranslations("classResources");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved = getResolvedStats(stored.id);

    const { spellSlots, classResources } = useMemo(
        () => parseDerivedResources(stored.resources),
        [stored.resources]
    );

    const resourceSignature = useMemo(
        () =>
            JSON.stringify({
                id: stored.id,
                spellSlots,
                classResources,
            }),
        [classResources, spellSlots, stored.id]
    );

    const [usedByKey, setUsedByKey] = useState<UsedSlotsByKey>({});

    useEffect(() => {
        setUsedByKey({});
    }, [resourceSignature]);

    const hasContent = spellSlots.length > 0 || classResources.length > 0;

    if (!hasContent) {
        return null;
    }

    const classSlug = stored.selections.characterClass;
    const classEntry = classSlug
        ? contentRepo(stored.system).getClass(classSlug, contentLocale)
        : undefined;
    const spellcastingAbility = classEntry?.spellcastingAbility ?? null;

    const spellSaveDc =
        resolved !== undefined
            ? computeSpellSaveDc(resolved, stored.system, stored.systemData)
            : null;
    const spellAttackBonus =
        resolved !== undefined
            ? computeSpellAttackBonus(resolved, stored.system, stored.systemData)
            : null;

    const formatLabel = (ref: string) =>
        formatResourceRefLabel(ref, (key) => tResources(key));

    const slotAria = (index: number, total: number, isUsed: boolean) =>
        isUsed
            ? t("resourceSlotUsed", { index, total })
            : t("resourceSlotAvailable", { index, total });

    const showCastingHeader =
        spellSlots.length > 0 &&
        classEntry !== undefined &&
        spellcastingAbility !== null;

    const handleToggle = (rowKey: string, index: number, total: number) => {
        setUsedByKey((current) => {
            const used = current[rowKey] ?? new Set<number>();
            const nextUsed = toggleSlot(index, total, used);

            if (nextUsed.size === 0) {
                const { [rowKey]: _removed, ...rest } = current;
                return rest;
            }

            return { ...current, [rowKey]: nextUsed };
        });
    };

    return (
        <div className={cn("flex flex-col gap-3 rounded-xl border p-3", sheetInset)}>
            {spellSlots.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {showCastingHeader ? (
                        <CastingStatsBlock
                            classLabel={t("castingClass")}
                            abilityLabel={t("castingAbility")}
                            saveDcLabel={t("spellSaveDc")}
                            attackLabel={t("spellAttackModifier")}
                            classNameValue={classEntry.name}
                            abilityValue={tAbilities(spellcastingAbility)}
                            saveDcValue={spellSaveDc}
                            attackValue={
                                spellAttackBonus !== null
                                    ? formatModifier(spellAttackBonus)
                                    : null
                            }
                        />
                    ) : null}

                    <div className="flex flex-col gap-2">
                        {spellSlots.map((slot) => (
                            <ResourceSquareRow
                                key={slot.ref}
                                rowKey={slot.ref}
                                label={t("spellSlotLevelLabel", {
                                    level: slot.level,
                                })}
                                count={slot.count}
                                usedIndices={usedByKey[slot.ref] ?? new Set()}
                                onToggle={(index) =>
                                    handleToggle(slot.ref, index, slot.count)
                                }
                                slotAriaLabel={slotAria}
                            />
                        ))}
                    </div>
                </div>
            ) : null}

            {classResources.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {classResources.map((resource) => (
                        <ResourceSquareRow
                            key={resource.ref}
                            rowKey={resource.ref}
                            label={`${formatLabel(resource.ref)}:`}
                            count={resource.count}
                            usedIndices={usedByKey[resource.ref] ?? new Set()}
                            onToggle={(index) =>
                                handleToggle(resource.ref, index, resource.count)
                            }
                            slotAriaLabel={slotAria}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
