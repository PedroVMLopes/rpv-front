"use client";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { PreparedSpellChoiceGrid } from "@/components/characters/creation/spells/PreparedSpellChoiceGrid";

type PrepareSpellsPageProps = {
    title: string;
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
};

export function PrepareSpellsPage({
    title,
    form,
    contentLocale,
    system,
}: PrepareSpellsPageProps) {
    const t = useTranslations("characterCreation.prepareSpells");

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{t("help")}</p>
            <PreparedSpellChoiceGrid
                form={form}
                contentLocale={contentLocale}
                system={system}
            />
        </div>
    );
}
