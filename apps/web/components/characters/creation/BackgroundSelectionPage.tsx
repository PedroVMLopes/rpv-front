"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import {
    DynamicForm,
    type FieldConfig,
} from "@/components/forms/DynamicForm";
import { CatalogSelectionPage } from "@/components/characters/creation/CatalogSelectionPage";
import { BACKGROUND_STEP_IDENTITY_FIELD_NAMES } from "@/lib/character/overviewIdentity";
import type { SystemKey } from "@/presets";

type BackgroundSelectionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    identityFields: FieldConfig[];
};

export function BackgroundSelectionPage({
    form,
    contentLocale,
    system,
    identityFields,
}: BackgroundSelectionPageProps) {
    const filteredIdentityFields = useMemo(
        () =>
            identityFields.filter((field) =>
                BACKGROUND_STEP_IDENTITY_FIELD_NAMES.has(field.name)
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
