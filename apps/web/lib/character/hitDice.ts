import { contentRepo } from "@/lib/content/contentRepository";
import type { SystemKey } from "@/presets";
import type { StoredCharacter } from "./storedCharacter";
import { getSystemRules } from "./systemRules";
import { readCharacterLevel } from "./skillModifiers";
import {
    HIT_DICE_RESOURCE,
    type HitDiceMerge,
} from "./vitality";
import { ROLLABLE_DICE, type DieSides } from "@/lib/roll/diceRoll";

export function buildHitDiceMerge(
    system: SystemKey,
    newLevel: number,
    classSlug: string | undefined,
    previousLevel?: number
): HitDiceMerge | undefined {
    const vitality = getSystemRules(system).vitality;
    if (!vitality) {
        return undefined;
    }

    const hitDie = classSlug
        ? contentRepo(system).getClass(classSlug)?.hitDie
        : undefined;
    if (!hitDie || hitDie <= 0) {
        return undefined;
    }

    const max = vitality.hitDiceMax(newLevel);
    if (max <= 0) {
        return undefined;
    }

    return {
        ref: vitality.hitDiceRef,
        max,
        ...(previousLevel !== undefined
            ? { previousMax: vitality.hitDiceMax(previousLevel) }
            : {}),
    };
}

export function getHitDieSides(
    stored: StoredCharacter
): DieSides | undefined {
    const classSlug = stored.selections.characterClass;
    if (!classSlug) {
        return undefined;
    }

    const hitDie = contentRepo(stored.system).getClass(classSlug)?.hitDie;
    if (!hitDie || !(ROLLABLE_DICE as readonly number[]).includes(hitDie)) {
        return undefined;
    }

    return hitDie as DieSides;
}

export function getHitDicePool(stored: StoredCharacter): {
    ref: string;
    current: number;
    max: number;
    sides?: DieSides;
} | undefined {
    const vitality = getSystemRules(stored.system).vitality;
    if (!vitality) {
        return undefined;
    }

    const max = vitality.hitDiceMax(readCharacterLevel(stored.systemData));
    const sides = getHitDieSides(stored);
    if (max <= 0 || !sides) {
        return undefined;
    }

    const current = stored.resources[vitality.hitDiceRef] ?? max;

    return {
        ref: vitality.hitDiceRef,
        current: Math.max(0, Math.min(current, max)),
        max,
        sides,
    };
}

export function isHitDiceResource(ref: string): boolean {
    return ref === HIT_DICE_RESOURCE;
}
