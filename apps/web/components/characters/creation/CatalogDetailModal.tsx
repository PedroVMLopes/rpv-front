"use client";

import type { Locale } from "@rpv/domain";
import type { ModifierSource } from "@rpv/domain";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import { GrantPreviewList } from "@/components/characters/creation/GrantPreviewList";
import type { SystemKey } from "@/presets";

type CatalogDetailModalProps = {
    model: ContentDetailModel;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contentLocale: Locale;
    system: SystemKey;
    source: ModifierSource;
};

export function CatalogDetailModal({
    model,
    open,
    onOpenChange,
    contentLocale,
    system,
    source,
}: CatalogDetailModalProps) {
    const grants =
        model.kind === "catalog" ? model.catalogGrants ?? [] : [];

    return (
        <ContentDetailModal
            model={model}
            open={open}
            onOpenChange={onOpenChange}
            afterContent={
                grants.length > 0 ? (
                    <GrantPreviewList
                        grants={grants}
                        contentLocale={contentLocale}
                        system={system}
                        source={source}
                    />
                ) : null
            }
        />
    );
}
