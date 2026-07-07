"use client";

import { useTranslations } from "next-intl";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { OtherProficienciesSection } from "./OtherProficienciesSection";
import { OverviewPanel } from "./OverviewPanel";

type ProficienciesCardProps = {
    stored: StoredCharacter;
};

export function ProficienciesCard({ stored }: ProficienciesCardProps) {
    const t = useTranslations("playerSheet");

    return (
        <OverviewPanel title={t("proficienciesCardTitle")}>
            <OtherProficienciesSection stored={stored} />
        </OverviewPanel>
    );
}
