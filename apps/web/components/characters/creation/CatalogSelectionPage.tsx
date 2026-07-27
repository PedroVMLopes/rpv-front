"use client";

import { useMemo, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import type { ModifierSource } from "@rpv/domain";
import type {
    CatalogFormField,
    CatalogSelectionContext,
    CatalogSelectionEntry,
    CatalogSelectionKind,
} from "@/lib/character/creation/catalogSelection.types";
import { getCatalogSelectionKindForField } from "@/lib/character/creation/catalogSelection.types";
import { buildCatalogDetailModel } from "@/lib/character/creation/buildCatalogDetailModel";
import { getCatalogSelectionSource } from "@/lib/character/creation/sources";
import { CatalogSelectionCard } from "@/components/characters/creation/CatalogSelectionCard";
import { CatalogSelectionGrid } from "@/components/characters/creation/CatalogSelectionGrid";
import { CatalogSelectionDetailPanel } from "@/components/characters/creation/CatalogSelectionDetailPanel";
import { CatalogDetailModal } from "@/components/characters/creation/CatalogDetailModal";
import type { SystemKey } from "@/presets";
import { readLevelFromForm } from "@/lib/character/level";

type CatalogSelectionPageProps = {
    formField: CatalogFormField;
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    context?: CatalogSelectionContext;
    disabled?: boolean;
};

function buildSourceForField(
    formField: CatalogFormField,
    entry: CatalogSelectionEntry
): ModifierSource {
    switch (formField) {
        case "race":
            return { type: "race", id: entry.slug };
        case "subrace":
            return { type: "race", id: entry.slug };
        case "characterClass":
            return { type: "class", id: entry.slug };
        case "subclass":
            return { type: "subclass", id: entry.slug };
        case "background":
            return { type: "background", id: entry.slug };
    }
}

export function CatalogSelectionPage({
    formField,
    form,
    contentLocale,
    system,
    context = {},
    disabled = false,
}: CatalogSelectionPageProps) {
    const kind: CatalogSelectionKind = getCatalogSelectionKindForField(formField);
    const catalogSource = getCatalogSelectionSource(system, kind);

    const { control } = form;
    const selectedSlug = useWatch({ control, name: formField });
    const watchedLevel = useWatch({ control, name: "level" });
    const characterLevel = readLevelFromForm({ level: watchedLevel });

    const resolvedContext: CatalogSelectionContext = useMemo(
        () => ({
            ...context,
            characterLevel: context.characterLevel ?? characterLevel,
        }),
        [context, characterLevel]
    );

    const entries = useMemo(
        () => catalogSource.list(contentLocale, resolvedContext),
        [catalogSource, contentLocale, resolvedContext]
    );

    const selectedEntry = useMemo(() => {
        if (typeof selectedSlug !== "string" || !selectedSlug) {
            return null;
        }

        return entries.find((entry) => entry.slug === selectedSlug) ?? null;
    }, [entries, selectedSlug]);

    const selectedSource = selectedEntry
        ? buildSourceForField(formField, selectedEntry)
        : null;

    const [expandedEntry, setExpandedEntry] =
        useState<CatalogSelectionEntry | null>(null);

    function applySelection(nextSlug: string) {
        form.setValue(formField, nextSlug, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function handleOpen(entry: CatalogSelectionEntry) {
        if (disabled) {
            return;
        }

        setExpandedEntry(entry);
    }

    function handleCancel() {
        setExpandedEntry(null);
    }

    function handleChoose() {
        if (!expandedEntry) {
            return;
        }

        applySelection(expandedEntry.slug);
        setExpandedEntry(null);
    }

    const expandedModel = expandedEntry
        ? buildCatalogDetailModel(expandedEntry, kind)
        : null;

    return (
        <div className="flex flex-col gap-2">
            <CatalogSelectionGrid>
                {entries.map((entry) => (
                    <CatalogSelectionCard
                        key={entry.slug}
                        entry={entry}
                        selected={selectedSlug === entry.slug}
                        onOpen={() => handleOpen(entry)}
                    />
                ))}
            </CatalogSelectionGrid>

            <CatalogSelectionDetailPanel
                entry={selectedEntry}
                selectionKind={kind}
                contentLocale={contentLocale}
                system={system}
                source={selectedSource}
            />

            {expandedModel && expandedEntry ? (
                <CatalogDetailModal
                    model={expandedModel}
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setExpandedEntry(null);
                        }
                    }}
                    contentLocale={contentLocale}
                    system={system}
                    source={buildSourceForField(formField, expandedEntry)}
                    selectionKind={kind}
                    metadata={expandedEntry.metadata}
                    onCancel={handleCancel}
                    onChoose={handleChoose}
                />
            ) : null}
        </div>
    );
}
