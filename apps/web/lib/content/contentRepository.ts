import { getContentRepository } from "@rpv/content";
import type { SystemKey } from "@/presets";

/** Web app seam for reading catalog and curation entries. */
export function contentRepo(system: SystemKey = "dnd") {
    return getContentRepository(system);
}
