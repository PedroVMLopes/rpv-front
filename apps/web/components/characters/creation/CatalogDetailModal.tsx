"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { ModifierSource } from "@rpv/domain";
import type {
    CatalogSelectionKind,
    CatalogSelectionMetadata,
} from "@/lib/character/creation/catalogSelection.types";
import { buildRaceResourcePreviewChips } from "@/lib/character/creation/raceCatalogResourceChips";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import { GrantPreviewGroupedPanel } from "@/components/characters/creation/GrantPreviewGroupedPanel";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import type { SystemKey } from "@/presets";

type CatalogDetailModalProps = {
    model: ContentDetailModel;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contentLocale: Locale;
    system: SystemKey;
    source: ModifierSource;
    selectionKind?: CatalogSelectionKind;
    metadata?: CatalogSelectionMetadata;
    onCancel: () => void;
    onChoose: () => void;
};

export function CatalogDetailModal({
    model,
    open,
    onOpenChange,
    contentLocale,
    system,
    source,
    selectionKind,
    metadata,
    onCancel,
    onChoose,
}: CatalogDetailModalProps) {
    const t = useTranslations("characterCreation");
    const tCommon = useTranslations("common");
    const grants =
        model.kind === "catalog" ? model.catalogGrants ?? [] : [];

    const extraResourceChips =
        selectionKind === "race"
            ? buildRaceResourcePreviewChips(metadata, {
                  speed: (speed) =>
                      t("selection.preview.speedValue", { speed }),
                  darkvision: () => t("selection.preview.darkvision"),
                  darkvisionWithRange: (range) =>
                      t("selection.preview.darkvisionValue", { range }),
              })
            : [];

    const showGroupedPreview =
        grants.length > 0 || extraResourceChips.length > 0;

    return (
        <ContentDetailModal
            model={model}
            open={open}
            onOpenChange={onOpenChange}
            afterContent={
                showGroupedPreview ? (
                    <GrantPreviewGroupedPanel
                        contexts={grants.map((grant) => ({ grant, source }))}
                        contentLocale={contentLocale}
                        system={system}
                        extraResourceChips={extraResourceChips}
                    />
                ) : null
            }
            footer={
                <DialogFooter className="sm:justify-between">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                    >
                        {tCommon("cancel")}
                    </Button>
                    <Button type="button" variant="default" onClick={onChoose}>
                        {t("selection.choose")}
                    </Button>
                </DialogFooter>
            }
        />
    );
}
