"use client";

import { useTranslations } from "next-intl";
import { contentRepo } from "@/lib/content/contentRepository";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { Button } from "@/components/ui/button";
import { OverviewPanel } from "../overview/OverviewPanel";

type ConditionsPanelProps = {
    stored: StoredCharacter;
};

const EMPTY_CONDITIONS: string[] = [];
const EXHAUSTION_MAX = 6;

export function ConditionsPanel({ stored }: ConditionsPanelProps) {
    const t = useTranslations("playerSheet");
    const tCombat = useTranslations("playerSheet.combat");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const setCharacterSession = useCharacterStore(
        (state) => state.setCharacterSession
    );
    const activeConditions = useCharacterStore(
        (state) =>
            state.characters.find((character) => character.id === stored.id)
                ?.session?.activeConditions ?? EMPTY_CONDITIONS
    );
    const exhaustion = useCharacterStore(
        (state) =>
            state.characters.find((character) => character.id === stored.id)
                ?.session?.exhaustion ?? 0
    );
    const catalog = contentRepo(stored.system).listConditions(contentLocale);
    const activeSet = new Set(activeConditions);
    const available = catalog.filter((entry) => !activeSet.has(entry.slug));

    const addCondition = (slug: string) => {
        if (!slug || activeSet.has(slug)) {
            return;
        }

        setCharacterSession(stored.id, {
            activeConditions: [...activeConditions, slug],
        });
    };

    const removeCondition = (slug: string) => {
        setCharacterSession(stored.id, {
            activeConditions: activeConditions.filter((entry) => entry !== slug),
        });
    };

    const setExhaustion = (next: number) => {
        const clamped = Math.max(0, Math.min(EXHAUSTION_MAX, next));
        setCharacterSession(stored.id, { exhaustion: clamped });
    };

    return (
        <OverviewPanel title={t("combat.conditionsImmunities")}>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2">
                    <div className="min-w-0">
                        <p className="text-sm font-medium">
                            {tCombat("exhaustion")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {tCombat("exhaustionLevel", { level: exhaustion })}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={exhaustion <= 0}
                            onClick={() => setExhaustion(exhaustion - 1)}
                            aria-label={tCombat("exhaustionDecrease")}
                        >
                            −
                        </Button>
                        <span
                            className="min-w-6 text-center text-sm font-semibold tabular-nums"
                            aria-live="polite"
                        >
                            {exhaustion}
                        </span>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={exhaustion >= EXHAUSTION_MAX}
                            onClick={() => setExhaustion(exhaustion + 1)}
                            aria-label={tCombat("exhaustionIncrease")}
                        >
                            +
                        </Button>
                    </div>
                </div>

                {activeConditions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noneYet")}</p>
                ) : (
                    <ul className="flex flex-wrap gap-2">
                        {activeConditions.map((slug) => {
                            const entry = catalog.find((item) => item.slug === slug);
                            const name = entry?.name ?? slug;

                            return (
                                <li key={slug}>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => removeCondition(slug)}
                                        aria-label={tCombat("removeCondition", {
                                            name,
                                        })}
                                    >
                                        {name}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                )}
                {available.length > 0 ? (
                    <label className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">
                            {tCombat("addCondition")}
                        </span>
                        <select
                            className="rounded-md border bg-background px-2 py-1 text-sm"
                            value=""
                            aria-label={tCombat("addCondition")}
                            onChange={(event) => {
                                addCondition(event.target.value);
                                event.target.value = "";
                            }}
                        >
                            <option value="">
                                {tCombat("addConditionPlaceholder")}
                            </option>
                            {available.map((entry) => (
                                <option key={entry.slug} value={entry.slug}>
                                    {entry.name}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : null}
            </div>
        </OverviewPanel>
    );
}
