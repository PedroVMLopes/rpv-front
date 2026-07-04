"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { computeSavingThrowModifiers } from "@/lib/character/savingThrowModifiers";
import {
    formatModifier,
    readCharacterLevel,
} from "@/lib/character/skillModifiers";
import { getSystemRules } from "@/lib/character/systemRules";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";

type DefenseSavesPanelProps = {
    stored: StoredCharacter;
};

export function DefenseSavesPanel({ stored }: DefenseSavesPanelProps) {
    const t = useTranslations("playerSheet");
    const tAbilities = useTranslations("abilities");
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved = getResolvedStats(stored.id);

    const rows = useMemo(() => {
        if (!resolved) {
            return [];
        }

        const rules = getSystemRules(stored.system);
        const saves = computeSavingThrowModifiers(
            stored.system,
            resolved,
            stored.grants ?? [],
            readCharacterLevel(stored.systemData)
        );

        return saves.map((save) => ({
            stat: save.stat,
            mod: rules.abilityModifier(resolved[save.stat] ?? 10),
            save: save.modifier,
            proficient: save.proficient,
        }));
    }, [resolved, stored.grants, stored.system, stored.systemData]);

    return (
        <section className="flex flex-col gap-3 rounded-2xl border p-3">
            <h2 className="text-sm font-bold">{t("combat.defenseSaves")}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs uppercase text-muted-foreground">
                            <th className="pb-2 pr-2 font-semibold">
                                {t("combat.stat")}
                            </th>
                            <th className="pb-2 pr-2 font-semibold">
                                {t("combat.mod")}
                            </th>
                            <th className="pb-2 font-semibold">
                                {t("combat.save")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.stat} className="border-t">
                                <td className="py-2 pr-2 font-medium">
                                    {tAbilities(row.stat)}
                                </td>
                                <td className="py-2 pr-2 tabular-nums">
                                    {formatModifier(row.mod)}
                                </td>
                                <td className="py-2 tabular-nums">
                                    <span className="font-semibold">
                                        {formatModifier(row.save)}
                                    </span>
                                    {row.proficient ? (
                                        <span className="ml-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                                            {t("combat.proficientShort")}
                                        </span>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
