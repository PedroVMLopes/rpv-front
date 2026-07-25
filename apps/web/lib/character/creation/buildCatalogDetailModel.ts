import type { CatalogSelectionEntry, CatalogSelectionKind } from "./catalogSelection.types";
import type { ContentDetailModel, ContentDetailSection } from "@/lib/content/contentDetail.types";
import { stripLeadingLabel } from "./textUtils";

export function buildCatalogDetailModel(
    entry: CatalogSelectionEntry,
    selectionKind: CatalogSelectionKind
): ContentDetailModel {
    const sections: ContentDetailSection[] = [];
    const metadata = entry.metadata;
    const rows: ContentDetailSection["rows"] = [];

    if (selectionKind === "class" && metadata?.hitDie) {
        rows.push({
            labelKey: "hitDie",
            value: `d${metadata.hitDie}`,
        });
    }

    if (metadata?.subclassLevel) {
        rows.push({
            labelKey: "subclassLevel",
            value: String(metadata.subclassLevel),
        });
    }

    if (metadata?.size) {
        rows.push({
            labelKey: "size",
            value: metadata.size,
        });
    }

    if (metadata?.speedWalk) {
        rows.push({
            labelKey: "speed",
            value: `${metadata.speedWalk} ft`,
        });
    }

    if (metadata?.asiDesc?.trim()) {
        rows.push({
            labelKey: "abilityScores",
            value: metadata.asiDesc.trim(),
        });
    }

    if (selectionKind === "race" && metadata?.ageDesc?.trim()) {
        rows.push({
            labelKey: "age",
            value: stripLeadingLabel(metadata.ageDesc, "Age"),
            fullWidth: true,
        });
    }

    if (selectionKind === "race" && metadata?.alignmentDesc?.trim()) {
        rows.push({
            labelKey: "alignment",
            value: stripLeadingLabel(metadata.alignmentDesc, "Alignment"),
            fullWidth: true,
        });
    }

    if (rows.length > 0) {
        sections.push({ rows });
    }

    return {
        id: entry.slug,
        kind: "catalog",
        title: entry.title,
        sections,
        description: entry.detailDescription,
        catalogGrants: entry.grants,
    };
}
