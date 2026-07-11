"use client";

import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import { CatalogSelectionPage } from "@/components/characters/creation/CatalogSelectionPage";
import type { SystemKey } from "@/presets";

type RaceSelectionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
};

export function RaceSelectionPage({
    form,
    contentLocale,
    system,
}: RaceSelectionPageProps) {
    return (
        <CatalogSelectionPage
            formField="race"
            form={form}
            contentLocale={contentLocale}
            system={system}
        />
    );
}
