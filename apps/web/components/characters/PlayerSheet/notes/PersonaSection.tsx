"use client";

import { useTranslations } from "next-intl";
import { DispositionAxisSlider } from "@/components/characters/DispositionAxisSlider";
import { OverviewPanel } from "@/components/characters/PlayerSheet/overview/OverviewPanel";
import { sheetInset } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import { listFilledBackgroundDetails } from "@/lib/character/flavorTables";
import {
    listPersonaPersonalityFields,
    readSystemDataString,
} from "@/lib/character/overviewIdentity";
import {
    PERSONA_DISPOSITION_AXIS_KEYS,
    PERSONA_DISPOSITION_UNSET_DISPLAY,
    PERSONA_EMPTY_DISPLAY,
    PERSONA_PRESENCE_FIELD_KEYS,
    readDispositionAxis,
    type PersonaDispositionAxisKey,
    type PersonaPresenceFieldKey,
} from "@/lib/character/personaFields";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { cn } from "@/lib/utils";

function displayOrEmpty(value: string | null): string {
    return value ?? PERSONA_EMPTY_DISPLAY;
}

type PersonaCardProps = {
    stored: StoredCharacter;
};

function PresenceCard({ stored }: PersonaCardProps) {
    const t = useTranslations("playerSheet.persona");
    const tFields = useTranslations("fields");

    const labelFor = (key: PersonaPresenceFieldKey) => tFields(key);

    return (
        <OverviewPanel title={t("presenceTitle")}>
            <dl className="flex flex-col gap-2 text-sm">
                {PERSONA_PRESENCE_FIELD_KEYS.map((key) => (
                    <div
                        key={key}
                        className={cn(
                            "flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                            sheetInset
                        )}
                    >
                        <dt className="text-muted-foreground">{labelFor(key)}</dt>
                        <dd className="text-right font-medium">
                            {displayOrEmpty(
                                readSystemDataString(stored.systemData, key)
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </OverviewPanel>
    );
}

function DispositionCard({ stored }: PersonaCardProps) {
    const t = useTranslations("playerSheet.persona");

    const axisLabel = (key: PersonaDispositionAxisKey) => {
        const left = t(`axes.${key}.left`);
        const right = t(`axes.${key}.right`);
        return `${left} – ${right}`;
    };

    return (
        <OverviewPanel title={t("dispositionTitle")}>
            <ul className="flex flex-col gap-3">
                {PERSONA_DISPOSITION_AXIS_KEYS.map((key, index) => {
                    const value = readDispositionAxis(stored.systemData, key);

                    return (
                        <li
                            key={key}
                            className="flex flex-col gap-1.5"
                            role="group"
                            aria-label={axisLabel(key)}
                            data-testid={`disposition-axis-${key}`}
                        >
                            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-muted-foreground">
                                <span>{t(`axes.${key}.left`)}</span>
                                <span className="text-right">
                                    {t(`axes.${key}.right`)}
                                </span>
                            </div>
                            <DispositionAxisSlider
                                disabled
                                value={
                                    value ?? PERSONA_DISPOSITION_UNSET_DISPLAY
                                }
                                colorIndex={index}
                                aria-label={axisLabel(key)}
                            />
                        </li>
                    );
                })}
            </ul>
        </OverviewPanel>
    );
}

function PersonalityCard({ stored }: PersonaCardProps) {
    const t = useTranslations("playerSheet");
    const tFields = useTranslations("fields");
    const fields = listPersonaPersonalityFields(stored);

    return (
        <OverviewPanel title={t("personalityTitle")}>
            <div className="flex flex-col gap-3">
                {fields.map((field) => (
                    <div key={field.key}>
                        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                            {tFields(field.key)}
                        </p>
                        <p className="text-sm">{displayOrEmpty(field.value)}</p>
                    </div>
                ))}
            </div>
        </OverviewPanel>
    );
}

function BackgroundDetailsCard({ stored }: PersonaCardProps) {
    const tPersona = useTranslations("playerSheet.persona");
    const tTables = useTranslations("characterCreation.flavorTable.tables");
    const details = listFilledBackgroundDetails(stored.systemData);

    if (details.length === 0) {
        return null;
    }

    return (
        <OverviewPanel title={tPersona("backgroundDetailsTitle")}>
            <div className="flex flex-col gap-3">
                {details.map((detail) => (
                    <div key={detail.slug}>
                        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                            {tTables.has(detail.slug)
                                ? tTables(detail.slug)
                                : detail.slug}
                        </p>
                        <p className="text-sm">{detail.value}</p>
                    </div>
                ))}
            </div>
        </OverviewPanel>
    );
}

type PersonaSectionProps = {
    stored: StoredCharacter;
};

export function PersonaSection({ stored }: PersonaSectionProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <PresenceCard stored={stored} />
                <DispositionCard stored={stored} />
            </div>
            <PersonalityCard stored={stored} />
            <BackgroundDetailsCard stored={stored} />
        </div>
    );
}
