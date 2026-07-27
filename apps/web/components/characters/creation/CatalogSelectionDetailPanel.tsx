"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { ModifierSource } from "@rpv/domain";
import type {
    CatalogSelectionEntry,
    CatalogSelectionKind,
} from "@/lib/character/creation/catalogSelection.types";
import { stripMarkdown } from "@/lib/character/creation/textUtils";
import { buildRaceResourcePreviewChips } from "@/lib/character/creation/raceCatalogResourceChips";
import { GrantPreviewGroupedPanel } from "@/components/characters/creation/GrantPreviewGroupedPanel";
import type { SystemKey } from "@/presets";

type CatalogSelectionDetailPanelProps = {
    entry: CatalogSelectionEntry | null;
    selectionKind: CatalogSelectionKind;
    contentLocale: Locale;
    system: SystemKey;
    source: ModifierSource | null;
};

export function CatalogSelectionDetailPanel({
    entry,
    selectionKind,
    contentLocale,
    system,
    source,
}: CatalogSelectionDetailPanelProps) {
    const t = useTranslations("characterCreation");

    if (!entry || !source) {
        return (
            <div
                className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground"
                data-testid="catalog-detail-placeholder"
            >
                {t(`selection.selectToPreview.${selectionKind}` as never)}
            </div>
        );
    }

    const description = stripMarkdown(entry.detailDescription);
    const raceResourceChips =
        selectionKind === "race"
            ? buildRaceResourcePreviewChips(entry.metadata, {
                  speed: (speed) =>
                      t("selection.preview.speedValue", { speed }),
                  darkvision: () => t("selection.preview.darkvision"),
                  darkvisionWithRange: (range) =>
                      t("selection.preview.darkvisionValue", { range }),
              })
            : [];
    const showGroupedPreview =
        entry.grants.length > 0 || raceResourceChips.length > 0;

    return (
        <div
            className="flex flex-col gap-2 rounded-xl border-3 bg-card text-card-foreground p-4"
            data-testid="catalog-detail-panel"
        >
            <h3 className="font-serif text-lg font-semibold">{entry.title}</h3>

            {description ? (
                <p className="text-sm leading-relaxed">
                    {description}
                </p>
            ) : null}

            {showGroupedPreview ? (
                <GrantPreviewGroupedPanel
                    contexts={entry.grants.map((grant) => ({ grant, source }))}
                    contentLocale={contentLocale}
                    system={system}
                    extraResourceChips={raceResourceChips}
                />
            ) : null}
        </div>
    );
}
