"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { contentRepo } from "@/lib/content/contentRepository";
import {
    computeSpellAttackBonus,
    computeSpellSaveDc,
} from "@/lib/character/combatModifiers";
import { buildSpellcastingSystemData } from "@/lib/character/spellcastingContext";
import {
    getResolvedStatsForCharacter,
    storedCharacterToProps,
} from "@/lib/character/characterAdapter";
import { parseDerivedResources } from "@/lib/character/deriveResourcesFromForm";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import { formatModifier } from "@/lib/character/skillModifiers";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { cn } from "@/lib/utils";
import { sheetInset } from "../playerSheetSurfaces";
import { CastingStatsBlock } from "./CastingStatsBlock";
import {
    ResourceSquareRow,
    updateUsedCountByKey,
    type UsedCountByKey,
} from "./sheetResourceSquares";

type SheetDerivedResourcesPanelProps = {
    stored: StoredCharacter;
    hideSpellSlots?: boolean;
};

export function SheetDerivedResourcesPanel({
    stored,
    hideSpellSlots = false,
}: SheetDerivedResourcesPanelProps) {
    const t = useTranslations("playerSheet");
    const tAbilities = useTranslations("abilities");
    const tResources = useTranslations("classResources");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved =
        getResolvedStats(stored.id) ??
        getResolvedStatsForCharacter(storedCharacterToProps(stored));

    const classSlug = stored.selections.characterClass;

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

    const classEntry = classSlug
        ? contentRepo(stored.system).getClass(classSlug, contentLocale)
        : undefined;
    const spellcastingAbility = classEntry?.spellcastingAbility ?? null;

    const spellcastingSystemData = buildSpellcastingSystemData(stored);

    const spellSaveDc = computeSpellSaveDc(
        resolved,
        stored.system,
        spellcastingSystemData
    );
    const spellAttackBonus = computeSpellAttackBonus(
        resolved,
        stored.system,
        spellcastingSystemData
    );

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
        setUsedCountByKey((current) =>
            updateUsedCountByKey(current, rowKey, index, total)
        );
    };

    const showSpellSlotRows = spellSlots.length > 0 && !hideSpellSlots;

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
                            saveDcValue={spellSaveDc!}
                            attackValue={formatModifier(spellAttackBonus!)}
                        />
                    ) : null}

                    {showSpellSlotRows ? (
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
                    ) : null}
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
