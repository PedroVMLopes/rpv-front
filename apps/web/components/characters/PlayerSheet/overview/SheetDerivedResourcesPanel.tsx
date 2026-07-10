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

type UsedCountByKey = Record<string, number>;

function isSlotUsed(index: number, total: number, usedCount: number): boolean {
    return index >= total - usedCount;
}

function toggleSlotCount(
    index: number,
    total: number,
    usedCount: number
): number {
    if (isSlotUsed(index, total, usedCount)) {
        return Math.max(0, usedCount - 1);
    }

    return Math.min(total, usedCount + 1);
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
    usedCount,
    onToggle,
    slotAriaLabel,
}: {
    rowKey: string;
    label: string;
    count: number;
    usedCount: number;
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
                    const isUsed = isSlotUsed(index, count, usedCount);

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

    const [usedCountByKey, setUsedCountByKey] = useState<UsedCountByKey>({});

    useEffect(() => {
        setUsedCountByKey({});
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
        setUsedCountByKey((current) => {
            const usedCount = current[rowKey] ?? 0;
            const nextCount = toggleSlotCount(index, total, usedCount);

            if (nextCount === 0) {
                const { [rowKey]: _removed, ...rest } = current;
                return rest;
            }

            return { ...current, [rowKey]: nextCount };
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
                                usedCount={usedCountByKey[slot.ref] ?? 0}
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
                            usedCount={usedCountByKey[resource.ref] ?? 0}
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
