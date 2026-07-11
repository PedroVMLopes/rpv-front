"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { CatalogSelectionPage } from "@/components/characters/creation/CatalogSelectionPage";
import type { SystemKey } from "@/presets";

type FieldConfig = {
    name: string;
    [key: string]: unknown;
};

type BackgroundSelectionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    identityFields: FieldConfig[];
};

const IDENTITY_FIELD_NAMES = new Set(["name", "age", "goals"]);

export function BackgroundSelectionPage({
    form,
    contentLocale,
    system,
    identityFields,
}: BackgroundSelectionPageProps) {
    const filteredIdentityFields = useMemo(
        () =>
            identityFields.filter((field) =>
                IDENTITY_FIELD_NAMES.has(field.name)
            ),
        [identityFields]
    );

    return (
        <div className="flex flex-col gap-6">
            <CatalogSelectionPage
                formField="background"
                form={form}
                contentLocale={contentLocale}
                system={system}
            />
            {filteredIdentityFields.length > 0 ? (
                <DynamicForm
                    form={form}
                    fields={filteredIdentityFields}
                    hideSubmit
                />
            ) : null}
        </div>
    );
}
