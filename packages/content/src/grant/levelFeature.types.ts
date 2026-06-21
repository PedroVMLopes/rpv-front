import type { Grant } from "./grant.types";

export interface LevelFeature {
    /** Inclusive: applies when characterLevel >= level. */
    level: number;
    grants: Grant[];
}
