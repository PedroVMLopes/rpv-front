"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { OverviewPanel } from "@/components/characters/PlayerSheet/overview/OverviewPanel";
import { sheetInset } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import { listFilledBackgroundDetails } from "@/lib/character/flavorTables";
import {
    listPersonaPersonalityFields,
    readSystemDataString,
} from "@/lib/character/overviewIdentity";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { cn } from "@/lib/utils";
import {
    PERSONA_DISPOSITION_AXES,
    PERSONA_EMPTY_DISPLAY,
    PERSONA_PRESENCE_FIELD_KEYS,
    PERSONA_SLIDER_MAX,
    PERSONA_SLIDER_MIN,
    PERSONA_SLIDER_STEP,
    type PersonaDispositionAxisKey,
    type PersonaPresenceFieldKey,
} from "./personaPlaceholders";

const DISPOSITION_SLIDER_RANGE_CLASSES = [
    "[&_[data-slot=slider-range]]:bg-chart-1",
    "[&_[data-slot=slider-range]]:bg-chart-2",
    "[&_[data-slot=slider-range]]:bg-chart-3",
    "[&_[data-slot=slider-range]]:bg-chart-4",
    "[&_[data-slot=slider-range]]:bg-chart-5",
] as const;

function displayOrEmpty(value: string | null): string {
    return value ?? PERSONA_EMPTY_DISPLAY;
}

function presenceDisplayValue(
    stored: StoredCharacter,
    key: PersonaPresenceFieldKey
): string {
    if (key === "age") {
        return displayOrEmpty(readSystemDataString(stored.systemData, "age"));
    }

    return PERSONA_EMPTY_DISPLAY;
}

type PersonaCardProps = {
    stored: StoredCharacter;
};

function PresenceCard({ stored }: PersonaCardProps) {
    const t = useTranslations("playerSheet.persona");
    const tFields = useTranslations("fields");

    const labelFor = (key: PersonaPresenceFieldKey) => {
        if (key === "age") {
            return tFields("age");
        }

        return t(`presenceFields.${key}`);
    };

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
                            {presenceDisplayValue(stored, key)}
                        </dd>
                    </div>
                ))}
            </dl>
        </OverviewPanel>
    );
}

function DispositionCard() {
    const t = useTranslations("playerSheet.persona");

    const axisLabel = (key: PersonaDispositionAxisKey) => {
        const left = t(`axes.${key}.left`);
        const right = t(`axes.${key}.right`);
        return `${left} – ${right}`;
    };

    return (
        <OverviewPanel title={t("dispositionTitle")}>
            <ul className="flex flex-col gap-3">
                {PERSONA_DISPOSITION_AXES.map((axis, index) => (
                    <li
                        key={axis.key}
                        className="flex flex-col gap-1.5"
                        role="group"
                        aria-label={axisLabel(axis.key)}
                    >
                        <div className="flex items-center justify-between gap-2 text-sm font-semibold text-muted-foreground">
                            <span>{t(`axes.${axis.key}.left`)}</span>
                            <span className="text-right">
                                {t(`axes.${axis.key}.right`)}
                            </span>
                        </div>
                        <Slider
                            disabled
                            min={PERSONA_SLIDER_MIN}
                            max={PERSONA_SLIDER_MAX}
                            step={PERSONA_SLIDER_STEP}
                            value={[axis.value]}
                            aria-label={axisLabel(axis.key)}
                            className={DISPOSITION_SLIDER_RANGE_CLASSES[index]}
                        />
                    </li>
                ))}
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
                <DispositionCard />
            </div>
            <PersonalityCard stored={stored} />
            <BackgroundDetailsCard stored={stored} />
        </div>
    );
}
