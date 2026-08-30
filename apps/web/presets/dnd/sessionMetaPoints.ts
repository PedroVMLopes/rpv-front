import type { SessionMetaPointTracker } from "../types";
import { INSPIRATION_REF } from "@/lib/character/sessionMetaPoints";

export const dndSessionMetaPoints: SessionMetaPointTracker[] = [
    {
        ref: INSPIRATION_REF,
        labelKey: "playerSheet.inspiration.label",
        max: 1,
    },
];
