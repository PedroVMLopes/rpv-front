"use client";

import { useTranslations } from "next-intl";

type PrepareSpellsPageProps = {
    title: string;
};

/**
 * Shell for the prepare-spells creation/level-up step.
 * Selection UI lands in a follow-up (step 5).
 */
export function PrepareSpellsPage({ title }: PrepareSpellsPageProps) {
    const t = useTranslations("characterCreation.prepareSpells");

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{t("placeholder")}</p>
        </div>
    );
}
