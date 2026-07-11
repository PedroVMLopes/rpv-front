import type { Grant } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";

export type CatalogSelectionKind =
    | "race"
    | "subrace"
    | "class"
    | "subclass"
    | "background";

export type CatalogSelectionBadge = {
    label: string;
    variant?: "default" | "muted";
};

export type CatalogSelectionMetadata = {
    hitDie?: number;
    subclassLevel?: number;
    speedWalk?: number;
    visionDesc?: string;
    size?: string;
    asiDesc?: string;
};

export type CatalogSelectionEntry = {
    slug: string;
    title: string;
    summary: string;
    detailDescription: string;
    grants: Grant[];
    badges?: CatalogSelectionBadge[];
    metadata?: CatalogSelectionMetadata;
};

export type CatalogSelectionContext = {
    raceSlug?: string;
    classSlug?: string;
    characterLevel?: number;
};

export type CatalogSelectionSource = {
    list: (
        locale: Locale,
        context: CatalogSelectionContext
    ) => CatalogSelectionEntry[];
};

export type CatalogFormField =
    | "race"
    | "subrace"
    | "characterClass"
    | "subclass"
    | "background";

export function getCatalogSelectionKindForField(
    field: CatalogFormField
): CatalogSelectionKind {
    switch (field) {
        case "race":
            return "race";
        case "subrace":
            return "subrace";
        case "characterClass":
            return "class";
        case "subclass":
            return "subclass";
        case "background":
            return "background";
    }
}

export function getCatalogSelectionSourceKey(
    system: SystemKey,
    kind: CatalogSelectionKind
): string {
    return `${system}:${kind}`;
}
