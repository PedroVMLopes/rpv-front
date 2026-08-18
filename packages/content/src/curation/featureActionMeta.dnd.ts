export type FeatureActionCost =
    | "action"
    | "bonus"
    | "reaction"
    | "special"
    | "passive";

export type FeatureActionMeta = {
    actionCost: FeatureActionCost;
    resourceRef?: string;
    tags?: string[];
};

const dndFeatureActionMeta: Record<string, FeatureActionMeta> = {
    "action-surge": {
        actionCost: "special",
        tags: ["feature", "burst"],
    },
    rage: {
        actionCost: "bonus",
        resourceRef: "rage-uses",
        tags: ["feature", "stance"],
    },
    "unarmored-defense": {
        actionCost: "passive",
        tags: ["passive", "defense"],
    },
    "reckless-attack": {
        actionCost: "special",
        tags: ["attack", "melee"],
    },
    "danger-sense": {
        actionCost: "passive",
        tags: ["passive", "defense"],
    },
    "extra-attack": {
        actionCost: "passive",
        tags: ["passive", "attack"],
    },
    "fast-movement": {
        actionCost: "passive",
        tags: ["passive", "movement"],
    },
    "martial-arts": {
        actionCost: "special",
        tags: ["attack", "monk"],
    },
    ki: {
        actionCost: "special",
        resourceRef: "ki-points",
        tags: ["resource", "monk"],
    },
    "unarmored-movement": {
        actionCost: "passive",
        tags: ["passive", "movement"],
    },
    "deflect-missiles": {
        actionCost: "reaction",
        tags: ["reaction", "defense"],
    },
    "stunning-strike": {
        actionCost: "special",
        resourceRef: "ki-points",
        tags: ["attack", "control"],
    },
    "improved-critical": {
        actionCost: "passive",
        tags: ["passive", "attack"],
    },
    "sculpt-spells": {
        actionCost: "passive",
        tags: ["passive", "spell"],
    },
    frenzy: {
        actionCost: "bonus",
        tags: ["attack", "rage"],
    },
    "open-hand-technique": {
        actionCost: "special",
        resourceRef: "ki-points",
        tags: ["attack", "control"],
    },
    "second-wind": {
        actionCost: "bonus",
        resourceRef: "second-wind-uses",
        tags: ["heal", "feature"],
    },
};

function slugifyFeatureName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function getFeatureActionMeta(
    featureName: string
): FeatureActionMeta | undefined {
    return dndFeatureActionMeta[slugifyFeatureName(featureName)];
}
