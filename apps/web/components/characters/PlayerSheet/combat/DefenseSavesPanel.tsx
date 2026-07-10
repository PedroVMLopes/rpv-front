"use client";

import { useMemo } from "react";
import { Dices } from "lucide-react";
import { useTranslations } from "next-intl";
import { computeSavingThrowModifiers } from "@/lib/character/savingThrowModifiers";
import {
    formatModifier,
    readCharacterLevel,
} from "@/lib/character/skillModifiers";
import { getSystemRules } from "@/lib/character/systemRules";
import { buildSavingThrowRollRequest } from "@/lib/roll/buildRollRequest";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Button } from "@/components/ui/button";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { OverviewPanel } from "../overview/OverviewPanel";

type DefenseSavesPanelProps = {
    stored: StoredCharacter;
};

export function DefenseSavesPanel({ stored }: DefenseSavesPanelProps) {
    const t = useTranslations("playerSheet");
    const tAbilities = useTranslations("abilities");
    const tRoll = useTranslations("playerSheet.roll");
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const { openRollRequest } = useRollAssistant();
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
            save,
            stat: save.stat,
            mod: rules.abilityModifier(resolved[save.stat] ?? 10),
            saveMod: save.modifier,
            proficient: save.proficient,
        }));
    }, [resolved, stored.grants, stored.system, stored.systemData]);

    return (
        <OverviewPanel title={t("combat.defenseSaves")}>
            <div className="overflow-x-auto rounded-xl border bg-muted">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs uppercase text-muted-foreground">
                            <th className="px-3 pb-2 pr-2 pt-3 font-semibold">
                                {t("combat.stat")}
                            </th>
                            <th className="px-3 pb-2 pr-2 pt-3 font-semibold">
                                {t("combat.mod")}
                            </th>
                            <th className="px-3 pb-2 pr-2 pt-3 font-semibold">
                                {t("combat.save")}
                            </th>
                            <th className="px-3 pb-2 pt-3 font-semibold">
                                <span className="sr-only">{tRoll("rollAction", { label: t("combat.save") })}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.stat} className="border-t">
                                <td className="px-3 py-2 pr-2 font-medium">
                                    {tAbilities(row.stat)}
                                </td>
                                <td className="px-3 py-2 pr-2 tabular-nums">
                                    {formatModifier(row.mod)}
                                </td>
                                <td className="px-3 py-2 pr-2 tabular-nums">
                                    <span className="font-semibold">
                                        {formatModifier(row.saveMod)}
                                    </span>
                                    {row.proficient ? (
                                        <span className="ml-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                                            {t("combat.proficientShort")}
                                        </span>
                                    ) : null}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        aria-label={tRoll("rollAction", {
                                            label: tAbilities(row.stat),
                                        })}
                                        onClick={() =>
                                            openRollRequest(
                                                buildSavingThrowRollRequest(
                                                    row.save,
                                                    tAbilities(row.stat)
                                                )
                                            )
                                        }
                                    >
                                        <Dices className="size-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </OverviewPanel>
    );
}
