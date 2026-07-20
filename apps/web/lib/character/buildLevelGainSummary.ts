import {
    getClassGrantSourcesForLevel,
    getClassSubclassLevel,
    getSubclassGrantSourcesForLevel,
    type Grant,
} from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "./characterAdapter";
import {
    isCantripGrant,
    isLeveledSpellGrant,
} from "./creationSteps/grantPickKey";
import {
    buildHpDerivationContextFromForm,
    deriveMaxHp,
} from "./hp";

export type LevelGainResourceDelta = {
    ref: string;
    amount: number;
};

export type LevelGainSpellPicks = {
    cantrips: number;
    spells: number;
};

export type LevelGainSummary = {
    featureLevel: number;
    subclassAvailable: boolean;
    hp?: { before: number; after: number };
    classResources: LevelGainResourceDelta[];
    subclassResources: LevelGainResourceDelta[];
    spellPicks: LevelGainSpellPicks;
};

export type BuildLevelGainSummaryInput = {
    formValues: Record<string, unknown>;
    featureLevel: number;
    system: SystemKey;
    contentLocale: Locale;
    /** Defaults to `["class"]`. */
    sourceTypes?: Array<"class" | "subclass">;
};

function grantsAtExactFeatureLevel(
    blocks: Array<{ grants: Grant[]; featureLevel?: number }>,
    featureLevel: number
): Grant[] {
    const grants: Grant[] = [];

    for (const block of blocks) {
        if (featureLevel === 1) {
            if (block.featureLevel !== undefined && block.featureLevel !== 1) {
                continue;
            }
            // Base grants (no featureLevel) count as level 1.
            if (block.featureLevel === undefined || block.featureLevel === 1) {
                grants.push(...block.grants);
            }
            continue;
        }

        if (block.featureLevel === featureLevel) {
            grants.push(...block.grants);
        }
    }

    return grants;
}

function collectResourceDeltas(grants: Grant[]): LevelGainResourceDelta[] {
    const byRef = new Map<string, number>();

    for (const grant of grants) {
        if (grant.grantType !== "resource" || grant.choose !== 0) {
            continue;
        }

        const ref = grant.ref?.trim();
        if (!ref) {
            continue;
        }

        const amount = grant.amount ?? 0;
        if (amount === 0) {
            continue;
        }

        byRef.set(ref, (byRef.get(ref) ?? 0) + amount);
    }

    return Array.from(byRef.entries()).map(([ref, amount]) => ({ ref, amount }));
}

function collectSpellPicks(grants: Grant[]): LevelGainSpellPicks {
    let cantrips = 0;
    let spells = 0;

    for (const grant of grants) {
        if (grant.grantType !== "spell" || grant.choose <= 0) {
            continue;
        }

        if (isCantripGrant(grant)) {
            cantrips += grant.choose;
        } else if (isLeveledSpellGrant(grant)) {
            spells += grant.choose;
        } else {
            // Untyped spell choose pools count as leveled spells.
            spells += grant.choose;
        }
    }

    return { cantrips, spells };
}

function resolveHpChange(
    formValues: Record<string, unknown>,
    system: SystemKey,
    contentLocale: Locale,
    featureLevel: number
): { before: number; after: number } | undefined {
    if (featureLevel <= 1) {
        return undefined;
    }

    const baseCtx = buildHpDerivationContextFromForm(
        formValues,
        system,
        contentLocale
    );
    if (!baseCtx) {
        return undefined;
    }

    const before = deriveMaxHp(system, {
        ...baseCtx,
        level: featureLevel - 1,
    });
    const after = deriveMaxHp(system, {
        ...baseCtx,
        level: featureLevel,
    });

    if (before === undefined || after === undefined) {
        return undefined;
    }

    return { before, after };
}

/**
 * Structured preview of gains at a single feature level for `level_summary` UI.
 * HP uses the form's CON/class but `featureLevel` (not the form's overall level).
 */
export function buildLevelGainSummary(
    input: BuildLevelGainSummaryInput
): LevelGainSummary {
    const {
        formValues,
        featureLevel,
        system,
        contentLocale,
        sourceTypes = ["class"],
    } = input;
    const selections = buildSelectionsFromForm(formValues);
    const classSlug = selections.characterClass;
    const subclassSlug = selections.subclass;

    let classGrants: Grant[] = [];
    let subclassGrants: Grant[] = [];

    if (sourceTypes.includes("class") && classSlug) {
        classGrants = grantsAtExactFeatureLevel(
            getClassGrantSourcesForLevel(classSlug, featureLevel),
            featureLevel
        );
    }

    if (sourceTypes.includes("subclass") && subclassSlug) {
        subclassGrants = grantsAtExactFeatureLevel(
            getSubclassGrantSourcesForLevel(subclassSlug, featureLevel),
            featureLevel
        );
    }

    const subclassLevel = classSlug
        ? getClassSubclassLevel(classSlug)
        : undefined;
    const subclassAvailable =
        sourceTypes.includes("class") &&
        subclassLevel !== undefined &&
        subclassLevel === featureLevel;

    const spellFromClass = collectSpellPicks(classGrants);
    const spellFromSubclass = collectSpellPicks(subclassGrants);

    return {
        featureLevel,
        subclassAvailable,
        hp: resolveHpChange(formValues, system, contentLocale, featureLevel),
        classResources: collectResourceDeltas(classGrants),
        subclassResources: collectResourceDeltas(subclassGrants),
        spellPicks: {
            cantrips: spellFromClass.cantrips + spellFromSubclass.cantrips,
            spells: spellFromClass.spells + spellFromSubclass.spells,
        },
    };
}

/** True when the summary has at least one row worth showing. */
export function hasLevelGainSummaryContent(summary: LevelGainSummary): boolean {
    return (
        summary.subclassAvailable ||
        summary.hp !== undefined ||
        summary.classResources.length > 0 ||
        summary.subclassResources.length > 0 ||
        summary.spellPicks.cantrips > 0 ||
        summary.spellPicks.spells > 0
    );
}
