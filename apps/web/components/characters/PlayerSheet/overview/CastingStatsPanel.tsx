"use client";

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
import { formatModifier } from "@/lib/character/skillModifiers";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { OverviewPanel } from "./OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

type CastingStatsPanelProps = {
    stored: StoredCharacter;
};

export function CastingStatsPanel({ stored }: CastingStatsPanelProps) {
    const t = useTranslations("playerSheet");
    const tAbilities = useTranslations("abilities");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved =
        getResolvedStats(stored.id) ??
        getResolvedStatsForCharacter(storedCharacterToProps(stored));

    const classSlug = stored.selections.characterClass;
    const classEntry = classSlug
        ? contentRepo(stored.system).getClass(classSlug, contentLocale)
        : undefined;
    const spellcastingAbility = classEntry?.spellcastingAbility ?? null;

    if (!classEntry || !spellcastingAbility) {
        return null;
    }

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

    if (spellSaveDc === null || spellAttackBonus === null) {
        return null;
    }

    const rows = [
        { label: t("castingClass"), value: classEntry.name },
        { label: t("castingAbility"), value: tAbilities(spellcastingAbility) },
        { label: t("spellSaveDc"), value: String(spellSaveDc) },
        {
            label: t("spellAttackModifier"),
            value: formatModifier(spellAttackBonus),
        },
    ];

    return (
        <OverviewPanel>
            <dl className="flex flex-col gap-2 text-sm">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className={cn(
                            "flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                            sheetInset
                        )}
                    >
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="font-medium tabular-nums">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </OverviewPanel>
    );
}
