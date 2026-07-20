import type { ItemEntry } from "@rpv/content";
import {
    buildItemPickContentModel,
    type ItemPickContentFormatters,
} from "./buildItemPickContentModel";
import type {
    ContentDetailModel,
    ContentSummaryModel,
} from "./contentDetail.types";

const defaultFormatters: ItemPickContentFormatters = {
    tItems: (key) => key,
    tContentDetail: (key) => key,
    missingValue: "—",
};

/**
 * Preview model for catalog/browse contexts. Prefer
 * `buildItemPickContentModel` when formatters (i18n) are available.
 */
export function buildItemPreviewContentModel(
    item: ItemEntry,
    formatters: ItemPickContentFormatters = defaultFormatters
): { summary: ContentSummaryModel; detail: ContentDetailModel } {
    return buildItemPickContentModel(item, formatters);
}
