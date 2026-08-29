import type { CharacterDeathSaves, StoredCharacter } from "./storedCharacter";

export const HIT_DICE_RESOURCE = "hit-dice";
export const DEATH_SAVE_MAX = 3;

export type DeathSaveOutcome =
    | "success"
    | "failure"
    | "critical_failure"
    | "critical_success";

export type VitalitySnapshot = {
    hp: number;
    maxHp: number;
    tempHp: number;
    deathSaves?: CharacterDeathSaves;
};

export type HitDiceMerge = {
    ref: string;
    max: number;
    previousMax?: number;
};

export function emptyDeathSaves(): CharacterDeathSaves {
    return { successes: 0, failures: 0 };
}

export function isDead(saves: CharacterDeathSaves | undefined): boolean {
    return (saves?.failures ?? 0) >= DEATH_SAVE_MAX;
}

export function isStable(
    hp: number,
    saves: CharacterDeathSaves | undefined
): boolean {
    return (
        hp === 0 &&
        (saves?.successes ?? 0) >= DEATH_SAVE_MAX &&
        !isDead(saves)
    );
}

export function isDying(
    hp: number,
    saves: CharacterDeathSaves | undefined
): boolean {
    return hp === 0 && !isDead(saves);
}

export function suggestDeathSaveOutcome(
    d20: number,
    extraTotal = 0
): DeathSaveOutcome {
    if (d20 <= 1) {
        return "critical_failure";
    }

    if (d20 >= 20) {
        return "critical_success";
    }

    if (d20 + extraTotal >= 10) {
        return "success";
    }

    return "failure";
}

export function applyDamage(input: {
    hp: number;
    tempHp: number;
    amount: number;
}): { hp: number; tempHp: number } {
    const amount = Math.max(0, Math.floor(input.amount));
    if (amount <= 0) {
        return {
            hp: Math.max(0, input.hp),
            tempHp: Math.max(0, input.tempHp),
        };
    }

    const absorbed = Math.min(Math.max(0, input.tempHp), amount);
    const remaining = amount - absorbed;

    return {
        tempHp: Math.max(0, input.tempHp) - absorbed,
        hp: Math.max(0, input.hp - remaining),
    };
}

export function applyHeal(input: {
    hp: number;
    maxHp: number;
    amount: number;
    deathSaves?: CharacterDeathSaves;
}): { hp: number; deathSaves?: CharacterDeathSaves } {
    const amount = Math.max(0, Math.floor(input.amount));
    const maxHp = Math.max(0, input.maxHp);
    const nextHp = Math.min(maxHp, Math.max(0, input.hp) + amount);

    if (input.hp <= 0 && nextHp > 0) {
        return { hp: nextHp };
    }

    return {
        hp: nextHp,
        ...(input.deathSaves ? { deathSaves: input.deathSaves } : {}),
    };
}

export function applyDeathSaveMark(
    saves: CharacterDeathSaves | undefined,
    outcome: DeathSaveOutcome
): CharacterDeathSaves | undefined {
    if (isDead(saves) || outcome === "critical_success") {
        return saves && (saves.successes > 0 || saves.failures > 0)
            ? saves
            : undefined;
    }

    const current = saves ?? emptyDeathSaves();

    if (outcome === "success") {
        const successes = Math.min(DEATH_SAVE_MAX, current.successes + 1);
        if (successes === 0 && current.failures === 0) {
            return undefined;
        }

        return { successes, failures: current.failures };
    }

    const added = outcome === "critical_failure" ? 2 : 1;
    const failures = Math.min(DEATH_SAVE_MAX, current.failures + added);

    if (current.successes === 0 && failures === 0) {
        return undefined;
    }

    return { successes: current.successes, failures };
}

export function mergeHitDiceCurrent(input: {
    existing?: number;
    max: number;
    previousMax?: number;
}): number {
    const max = Math.max(0, input.max);
    if (input.existing === undefined) {
        return max;
    }

    const previousMax = input.previousMax ?? input.max;
    const gained = Math.max(0, max - previousMax);
    return Math.max(0, Math.min(max, input.existing + gained));
}

export type VitalityChange =
    | { type: "damage"; amount: number }
    | { type: "heal"; amount: number }
    | { type: "setTempHp"; value: number }
    | { type: "deathSave"; outcome: DeathSaveOutcome }
    | { type: "spendHitDie"; dieRoll: number };

export type ApplyVitalityContext = {
    maxHp: number;
    constitution: number;
    hitDieHeal: (dieRoll: number, constitution: number) => number;
    hitDiceRef: string;
};

export function applyVitalityToCharacter(
    stored: StoredCharacter,
    change: VitalityChange,
    context: ApplyVitalityContext
): StoredCharacter {
    const hp = stored.resources.hp ?? 0;
    const tempHp = stored.session?.tempHp ?? 0;
    const deathSaves = stored.session?.deathSaves ?? undefined;

    if (change.type === "setTempHp") {
        const nextTemp = Math.max(0, Math.floor(change.value));
        return withSessionResources(stored, {
            hp,
            tempHp: nextTemp,
            deathSaves,
        });
    }

    if (change.type === "damage") {
        const next = applyDamage({ hp, tempHp, amount: change.amount });
        return withSessionResources(stored, {
            hp: next.hp,
            tempHp: next.tempHp,
            deathSaves,
        });
    }

    if (change.type === "heal") {
        const next = applyHeal({
            hp,
            maxHp: context.maxHp,
            amount: change.amount,
            deathSaves,
        });
        return withSessionResources(stored, {
            hp: next.hp,
            tempHp,
            deathSaves: next.deathSaves,
        });
    }

    if (change.type === "deathSave") {
        if (!isDying(hp, deathSaves) && !isDead(deathSaves)) {
            return stored;
        }

        if (change.outcome === "critical_success") {
            const next = applyHeal({
                hp,
                maxHp: context.maxHp,
                amount: 1,
                deathSaves,
            });
            return withSessionResources(stored, {
                hp: next.hp,
                tempHp,
                deathSaves: next.deathSaves,
            });
        }

        if (isDead(deathSaves)) {
            return stored;
        }

        return withSessionResources(stored, {
            hp,
            tempHp,
            deathSaves: applyDeathSaveMark(deathSaves, change.outcome),
        });
    }

    const currentDice = stored.resources[context.hitDiceRef] ?? 0;
    if (currentDice < 1) {
        return stored;
    }

    const healed = applyHeal({
        hp,
        maxHp: context.maxHp,
        amount: context.hitDieHeal(change.dieRoll, context.constitution),
        deathSaves,
    });

    return withSessionResources(
        stored,
        {
            hp: healed.hp,
            tempHp,
            deathSaves: healed.deathSaves,
        },
        { [context.hitDiceRef]: currentDice - 1 }
    );
}

function withSessionResources(
    stored: StoredCharacter,
    snapshot: {
        hp: number;
        tempHp: number;
        deathSaves?: CharacterDeathSaves;
    },
    extraResources?: Record<string, number>
): StoredCharacter {
    const session = {
        ...stored.session,
        tempHp: snapshot.tempHp > 0 ? snapshot.tempHp : undefined,
        deathSaves: snapshot.deathSaves,
    };

    if (snapshot.tempHp <= 0) {
        delete session.tempHp;
    }

    if (!snapshot.deathSaves) {
        delete session.deathSaves;
    }

    const hasSession =
        session.concentratingOn ||
        (session.activeConditions && session.activeConditions.length > 0) ||
        session.tempHp ||
        session.deathSaves;

    return {
        ...stored,
        resources: {
            ...stored.resources,
            hp: snapshot.hp,
            ...extraResources,
        },
        session: hasSession ? session : undefined,
    };
}
