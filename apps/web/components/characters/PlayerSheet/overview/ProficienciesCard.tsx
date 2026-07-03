"use client";

import { useTranslations } from "next-intl";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { OtherProficienciesSection } from "./OtherProficienciesSection";

type ProficienciesCardProps = {
    stored: StoredCharacter;
};

export function ProficienciesCard({ stored }: ProficienciesCardProps) {
    const t = useTranslations("playerSheet");

    return (
        <section className="flex flex-col gap-3 rounded-2xl border p-3">
            <h2 className="text-sm font-bold">{t("proficienciesCardTitle")}</h2>
            <OtherProficienciesSection stored={stored} />
        </section>
    );
}
