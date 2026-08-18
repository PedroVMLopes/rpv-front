"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import {
    DynamicForm,
    type FieldConfig,
} from "@/components/forms/DynamicForm";
import { CatalogSelectionPage } from "@/components/characters/creation/CatalogSelectionPage";
import { FlavorTableField } from "@/components/characters/creation/FlavorTableField";
import { BACKGROUND_STEP_IDENTITY_FIELD_NAMES } from "@/lib/character/overviewIdentity";
import {
    boundFlavorTables,
    isBoundFlavorTable,
    sanitizeFlavorFieldsOnBackgroundChange,
} from "@/lib/character/flavorTables";
import { contentRepo } from "@/lib/content/contentRepository";
import type { SystemKey } from "@/presets";

type BackgroundSelectionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    identityFields: FieldConfig[];
};

function readBackgroundSlug(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

export function BackgroundSelectionPage({
    form,
    contentLocale,
    system,
    identityFields,
}: BackgroundSelectionPageProps) {
    const t = useTranslations();
    const tFields = useTranslations("fields");
    const tFlavorTables = useTranslations("characterCreation.flavorTable.tables");
    const backgroundSlug = readBackgroundSlug(form.watch("background"));
    const previousSlugRef = useRef<string | undefined>(undefined);
    const didInitRef = useRef(false);

    const backgroundEntry = useMemo(
        () =>
            backgroundSlug
                ? contentRepo(system).getBackground(backgroundSlug, contentLocale)
                : undefined,
        [backgroundSlug, contentLocale, system]
    );

    const flavorTables = backgroundEntry?.flavorTables ?? [];

    const coveredBindTos = useMemo(
        () =>
            new Set(
                boundFlavorTables(backgroundEntry).map((table) => table.bindTo)
            ),
        [backgroundEntry]
    );

    const filteredIdentityFields = useMemo(
        () =>
            identityFields.filter(
                (field) =>
                    BACKGROUND_STEP_IDENTITY_FIELD_NAMES.has(field.name) &&
                    !coveredBindTos.has(field.name)
            ),
        [coveredBindTos, identityFields]
    );

    useEffect(() => {
        if (!didInitRef.current) {
            didInitRef.current = true;
            previousSlugRef.current = backgroundSlug;
            return;
        }

        const previousSlug = previousSlugRef.current ?? "";
        if (previousSlug === backgroundSlug) {
            return;
        }

        const previous = previousSlug
            ? contentRepo(system).getBackground(previousSlug, contentLocale)
            : undefined;
        const next = backgroundSlug
            ? contentRepo(system).getBackground(backgroundSlug, contentLocale)
            : undefined;
        const patch = sanitizeFlavorFieldsOnBackgroundChange({
            previous,
            next,
            values: form.getValues(),
        });

        for (const [fieldName, value] of Object.entries(patch)) {
            form.setValue(fieldName, value, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }

        previousSlugRef.current = backgroundSlug;
    }, [backgroundSlug, contentLocale, form, system]);

    const resolveFieldLabel = (table: (typeof flavorTables)[number]): string => {
        if (!isBoundFlavorTable(table)) {
            return tFlavorTables.has(table.slug)
                ? tFlavorTables(table.slug)
                : table.slug;
        }

        const field = identityFields.find((item) => item.name === table.bindTo);
        if (field?.labelKey) {
            return t(field.labelKey);
        }
        if (field?.label) {
            return field.label;
        }
        return tFields.has(table.bindTo) ? tFields(table.bindTo) : table.bindTo;
    };

    return (
        <div className="flex flex-col gap-6">
            <CatalogSelectionPage
                formField="background"
                form={form}
                contentLocale={contentLocale}
                system={system}
            />
            {flavorTables.length > 0 ? (
                <div className="flex flex-col gap-6">
                    {flavorTables.map((table) => (
                        <FlavorTableField
                            key={`${table.slug}:${table.bindTo ?? "unbound"}`}
                            form={form}
                            table={table}
                            fieldLabel={resolveFieldLabel(table)}
                        />
                    ))}
                </div>
            ) : null}
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
