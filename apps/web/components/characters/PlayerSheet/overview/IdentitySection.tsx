"use client";

import { useTranslations } from "next-intl";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    listOverviewOriginFacts,
    type OverviewOriginFact,
} from "@/lib/character/overviewIdentity";
import { useContentLocale } from "@/store/useContentLocale";
import { OverviewPanel } from "./OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

type IdentitySummarySectionProps = {
    stored: StoredCharacter;
};

function originFactDisplay(
    fact: OverviewOriginFact,
    labels: {
        background: string;
        size: string;
        darkvision: string;
        darkvisionFallback: string;
        darkvisionValue: (range: number) => string;
        hitDie: string;
    }
): { label: string; value: string } {
    switch (fact.key) {
        case "background":
            return { label: labels.background, value: fact.value };
        case "size":
            return { label: labels.size, value: fact.value };
        case "darkvision":
            return {
                label: labels.darkvision,
                value:
                    fact.rangeFeet !== null
                        ? labels.darkvisionValue(fact.rangeFeet)
                        : labels.darkvisionFallback,
            };
        case "hitDie":
            return { label: labels.hitDie, value: `d${fact.die}` };
    }
}

export function IdentitySummarySection({ stored }: IdentitySummarySectionProps) {
    const t = useTranslations("playerSheet");
    const tFields = useTranslations("fields");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const facts = listOverviewOriginFacts(stored, contentLocale);

    if (facts.length === 0) {
        return null;
    }

    const labels = {
        background: tFields("background"),
        size: t("size"),
        darkvision: t("darkvision"),
        darkvisionFallback: "—",
        darkvisionValue: (range: number) => t("darkvisionValue", { range }),
        hitDie: t("hitDie"),
    };

    return (
        <OverviewPanel>
            <dl className="flex flex-col gap-2 text-sm">
                {facts.map((fact) => {
                    const { label, value } = originFactDisplay(fact, labels);

                    return (
                        <div
                            key={fact.key}
                            className={cn(
                                "flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                                sheetInset
                            )}
                        >
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd className="font-medium">{value}</dd>
                        </div>
                    );
                })}
            </dl>
        </OverviewPanel>
    );
}
