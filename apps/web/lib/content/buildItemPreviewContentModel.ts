import type { ItemEntry } from "@rpv/content";
import type {
    ContentDetailModel,
    ContentSummaryModel,
} from "./contentDetail.types";

export function buildItemPreviewContentModel(
    item: ItemEntry
): { summary: ContentSummaryModel; detail: ContentDetailModel } {
    const summary: ContentSummaryModel = {
        id: item.slug,
        kind: "item",
        title: item.name,
        badges: [],
    };

    const detail: ContentDetailModel = {
        id: item.slug,
        kind: "item",
        title: item.name,
        sections: [],
        description: item.description,
    };

    return { summary, detail };
}
