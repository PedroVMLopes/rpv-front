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

    if (!background && !goals) {
        return <RaceTraitsBlock stored={stored} />;
    }

    return (
        <section className="flex flex-col gap-2">
            <RaceTraitsBlock stored={stored} />

            {background ? (
                <div className="flex flex-col gap-1 rounded-2xl border bg-popover p-2 px-3 text-popover-foreground">
                    <p className="text-sm opacity-60">{t("background")}</p>
                    <p className="font-medium">{background}</p>
                </div>
            ) : null}

            {goals ? (
                <div className="flex flex-col gap-1 rounded-2xl border bg-popover p-2 px-3 text-popover-foreground">
                    <p className="text-sm opacity-60">{t("goals")}</p>
                    <p>{goals}</p>
                </div>
            ) : null}
        </section>
    );
}
