"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { ModifierSource } from "@rpv/domain";
import type {
    CatalogSelectionEntry,
    CatalogSelectionKind,
} from "@/lib/character/creation/catalogSelection.types";
import { stripMarkdown } from "@/lib/character/creation/textUtils";
import { GrantPreviewList } from "@/components/characters/creation/GrantPreviewList";
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

    return (
        <div
            className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4"
            data-testid="catalog-detail-panel"
        >
            <h3 className="font-serif text-lg font-semibold">{entry.title}</h3>

            {description ? (
                <section className="flex flex-col gap-2">
                    <h4 className="text-sm font-bold">
                        {t("selection.description")}
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                </section>
            ) : null}

            {entry.grants.length > 0 ? (
                <section className="flex flex-col gap-2">
                    <h4 className="text-sm font-bold">
                        {t("selection.grants")}
                    </h4>
                    <GrantPreviewList
                        grants={entry.grants}
                        contentLocale={contentLocale}
                        system={system}
                        source={source}
                    />
                </section>
            ) : null}
        </div>
    );
}
