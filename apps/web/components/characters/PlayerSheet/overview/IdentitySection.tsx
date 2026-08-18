"use client";

import { useTranslations } from "next-intl";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    listOverviewPersonalityFields,
    readSystemDataString,
    resolveOverviewBackground,
} from "@/lib/character/overviewIdentity";
import { OverviewPanel } from "./OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

type IdentitySummarySectionProps = {
    stored: StoredCharacter;
};

export function IdentitySummarySection({ stored }: IdentitySummarySectionProps) {
    const t = useTranslations("fields");
    const age = readSystemDataString(stored.systemData, "age");
    const background = resolveOverviewBackground(stored);

    if (!age && !background) {
        return null;
    }

    return (
        <OverviewPanel>
            <dl className="flex flex-col gap-2 text-sm">
                {age ? (
                    <div
                        className={cn(
                            "flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                            sheetInset
                        )}
                    >
                        <dt className="text-muted-foreground">{t("age")}</dt>
                        <dd className="font-medium">{age}</dd>
                    </div>
                ) : null}
                {background ? (
                    <div
                        className={cn(
                            "flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                            sheetInset
                        )}
                    >
                        <dt className="text-muted-foreground">{t("background")}</dt>
                        <dd className="font-medium">{background.name}</dd>
                    </div>
                ) : null}
            </dl>
        </OverviewPanel>
    );
}

type IdentitySectionProps = {
    stored: StoredCharacter;
};

export function IdentitySection({ stored }: IdentitySectionProps) {
    const tFields = useTranslations("fields");
    const tSheet = useTranslations("playerSheet");
    const background = resolveOverviewBackground(stored);
    const personalityFields = listOverviewPersonalityFields(stored);
    const backgroundDescription = background?.description;

    if (!backgroundDescription && personalityFields.length === 0) {
        return null;
    }

    return (
        <OverviewPanel title={tSheet("personalityTitle")}>
            <div className="flex flex-col gap-3">
                {backgroundDescription ? (
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                            {tFields("background")}
                        </p>
                        <p className="text-sm">{backgroundDescription}</p>
                    </div>
                ) : null}
                {personalityFields.map((field) => (
                    <div key={field.key}>
                        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                            {tFields(field.key)}
                        </p>
                        <p className="text-sm">{field.value}</p>
                    </div>
                ))}
            </div>
        </OverviewPanel>
    );
}
