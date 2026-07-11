"use client";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { getClassSubclassLevel } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import { CatalogSelectionPage } from "@/components/characters/creation/CatalogSelectionPage";
import { readLevelFromForm } from "@/lib/character/level";
import type { SystemKey } from "@/presets";

type SubclassSelectionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
};

export function SubclassSelectionPage({
    form,
    contentLocale,
    system,
}: SubclassSelectionPageProps) {
    const tFields = useTranslations("fields");
    const classSlug = form.watch("characterClass");
    const level = readLevelFromForm(form.getValues());
    const subclassLevel =
        typeof classSlug === "string" && classSlug
            ? getClassSubclassLevel(classSlug)
            : undefined;
    const locked =
        subclassLevel !== undefined && level < subclassLevel;

    return (
        <div className="flex flex-col gap-4">
            {locked ? (
                <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
                    {tFields("subclassLocked", { level: subclassLevel })}
                </p>
            ) : null}
            <CatalogSelectionPage
                formField="subclass"
                form={form}
                contentLocale={contentLocale}
                system={system}
                context={{
                    classSlug:
                        typeof classSlug === "string" ? classSlug : undefined,
                    characterLevel: level,
                }}
                disabled={locked}
            />
        </div>
    );
}
