"use client";

import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import { CatalogSelectionPage } from "@/components/characters/creation/CatalogSelectionPage";
import { CharacterLevelSelector } from "@/components/characters/CharacterLevelSelector";
import type { SystemKey } from "@/presets";

type ClassSelectionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
};

export function ClassSelectionPage({
    form,
    contentLocale,
    system,
}: ClassSelectionPageProps) {
    return (
        <div className="flex flex-col gap-6">
            <CharacterLevelSelector form={form} />
            <CatalogSelectionPage
                formField="characterClass"
                form={form}
                contentLocale={contentLocale}
                system={system}
            />
        </div>
    );
}
