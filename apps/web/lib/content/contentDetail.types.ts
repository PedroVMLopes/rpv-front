export type ContentDetailRow = {
    labelKey: string;
    value: string;
    fullWidth?: boolean;
    /** When true, panel may render +/- next to the quantity label. */
    quantityControls?: boolean;
};

export type ContentDetailSection = {
    rows: ContentDetailRow[];
};

export type ContentUseActionSpec = {
    label: string;
    kind: "roll" | "cast";
    /** Distinguishes split attack vs damage buttons on item cards. */
    role?: "attack" | "damage" | "ritual";
    /** i18n key under contentDetail for caption below the button. */
    captionKey?: "toHitCaption" | "damageCaption";
    disabled?: boolean;
};

import type { Grant } from "@rpv/content";

export type ContentDetailModel = {
    id: string;
    kind: "spell" | "item" | "catalog" | "feature";
    title: string;
    sections: ContentDetailSection[];
    shortDescription?: string;
    description?: string;
    higherLevel?: string;
    source?: string;
    useAction?: ContentUseActionSpec;
    useActions?: ContentUseActionSpec[];
    catalogGrants?: Grant[];
};

export type ContentSummaryModel = {
    id: string;
    kind: "spell" | "item" | "feature";
    title: string;
    badges: Array<{ label: string; variant?: "default" | "muted" }>;
    shortDescription?: string;
    useAction?: ContentUseActionSpec;
    useActions?: ContentUseActionSpec[];
};

export type SpellContentModels = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
};

export type WeaponContentModels = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
};

export type ItemContentModels = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
};
