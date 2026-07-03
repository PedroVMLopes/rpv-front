"use client";

import { useTranslations } from "next-intl";
import { RaceTraitsBlock } from "@/components/characters/CharacterCard/CharacterCardRaceInfo";
import type { StoredCharacter } from "@/lib/character/storedCharacter";

type IdentitySectionProps = {
    stored: StoredCharacter;
};

export function IdentitySection({ stored }: IdentitySectionProps) {
    const t = useTranslations("fields");
    const systemData = stored.systemData;
    const background =
        systemData.background !== undefined &&
        systemData.background !== null &&
        String(systemData.background).trim() !== ""
            ? String(systemData.background)
            : null;
    const goals =
        systemData.goals !== undefined &&
        systemData.goals !== null &&
        String(systemData.goals).trim() !== ""
            ? String(systemData.goals)
            : null;

    return (
        <section className="flex flex-col gap-4">
            <RaceTraitsBlock stored={stored} />

            {background ? (
                <div className="flex flex-col gap-1 rounded-2xl border p-3">
                    <p className="text-sm font-bold">{t("background")}</p>
                    <p className="text-sm">{background}</p>
                </div>
            ) : null}

            {goals ? (
                <div className="flex flex-col gap-1 rounded-2xl border p-3">
                    <p className="text-sm font-bold">{t("goals")}</p>
                    <p className="text-sm">{goals}</p>
                </div>
            ) : null}
        </section>
    );
}
