import type { Grant } from "../grant/grant.types";

/** Community/authored feat. Empty in the bundled catalog until content lands. */
export interface FeatEntry {
    slug: string;
    name: string;
    description?: string;
    grants: Grant[];
}
