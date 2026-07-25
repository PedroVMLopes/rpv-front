export type ContentDetailRow = {
    labelKey: string;
    value: string;
    fullWidth?: boolean;
};

export type ContentDetailSection = {
    rows: ContentDetailRow[];
};

export type ContentUseActionSpec = {
    label: string;
    kind: "roll" | "cast";
    disabled?: boolean;
};

import type { Grant } from "@rpv/content";

export type ContentDetailModel = {
    id: string;
    kind: "spell" | "item" | "catalog";
    title: string;
    sections: ContentDetailSection[];
    description?: string;
    higherLevel?: string;
    useAction?: ContentUseActionSpec;
    catalogGrants?: Grant[];
};

export type ContentSummaryModel = {
    id: string;
    kind: "spell" | "item";
    title: string;
    badges: Array<{ label: string; variant?: "default" | "muted" }>;
    shortDescription?: string;
    useAction?: ContentUseActionSpec;
};

export type SpellContentModels = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
};

export type WeaponContentModels = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
};
