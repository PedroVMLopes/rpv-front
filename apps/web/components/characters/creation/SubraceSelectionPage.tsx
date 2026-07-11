"use client";

import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import { CatalogSelectionPage } from "@/components/characters/creation/CatalogSelectionPage";
import type { SystemKey } from "@/presets";

type SubraceSelectionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
};

export function SubraceSelectionPage({
    form,
    contentLocale,
    system,
}: SubraceSelectionPageProps) {
    const raceSlug = form.watch("race");

    return (
        <CatalogSelectionPage
            formField="subrace"
            form={form}
            contentLocale={contentLocale}
            system={system}
            context={{
                raceSlug: typeof raceSlug === "string" ? raceSlug : undefined,
            }}
        />
    );
}
