"use client";

import { useMemo } from "react";
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

function ResourceSquare({ ariaLabel }: { ariaLabel: string }) {
    return (
        <div
            role="img"
            aria-label={ariaLabel}
            className={cn("size-6 shrink-0 rounded-sm border bg-muted", sheetInset)}
        />
    );
}

function ResourceSquareRow({
    label,
    count,
    slotAriaLabel,
}: {
    label: string;
    count: number;
    slotAriaLabel: (index: number, total: number) => string;
}) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-20 shrink-0 text-xs font-semibold text-muted-foreground">
                {label}
            </span>
            <div className="flex flex-wrap gap-1">
                {Array.from({ length: count }, (_, index) => (
                    <ResourceSquare
                        key={index}
                        ariaLabel={slotAriaLabel(index + 1, count)}
                    />
                ))}
            </div>
        </div>
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

    const slotAria = (index: number, total: number) =>
        t("resourceSlotAria", { index, total });

    const showCastingHeader =
        spellSlots.length > 0 &&
        classEntry !== undefined &&
        spellcastingAbility !== null;

    return (
        <div className={cn("flex flex-col gap-3 rounded-xl border p-3", sheetInset)}>
            {spellSlots.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {showCastingHeader ? (
                        <dl className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
                            <div>
                                <dt className="font-semibold uppercase text-muted-foreground">
                                    {t("castingClass")}
                                </dt>
                                <dd className="font-medium">{classEntry.name}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold uppercase text-muted-foreground">
                                    {t("castingAbility")}
                                </dt>
                                <dd className="font-medium">
                                    {tAbilities(spellcastingAbility)}
                                </dd>
                            </div>
                            {spellSaveDc !== null ? (
                                <div>
                                    <dt className="font-semibold uppercase text-muted-foreground">
                                        {t("spellSaveDc")}
                                    </dt>
                                    <dd className="font-medium tabular-nums">
                                        {spellSaveDc}
                                    </dd>
                                </div>
                            ) : null}
                            {spellAttackBonus !== null ? (
                                <div>
                                    <dt className="font-semibold uppercase text-muted-foreground">
                                        {t("spellAttackModifier")}
                                    </dt>
                                    <dd className="font-medium tabular-nums">
                                        {formatModifier(spellAttackBonus)}
                                    </dd>
                                </div>
                            ) : null}
                        </dl>
                    ) : null}

                    <div className="flex flex-col gap-2">
                        {spellSlots.map((slot) => (
                            <ResourceSquareRow
                                key={slot.ref}
                                label={t("spellSlotLevelLabel", {
                                    level: slot.level,
                                })}
                                count={slot.count}
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
                            label={`${formatLabel(resource.ref)}:`}
                            count={resource.count}
                            slotAriaLabel={slotAria}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
