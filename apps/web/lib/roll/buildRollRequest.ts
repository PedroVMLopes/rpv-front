import type { DieSides } from "./diceRoll";
import { parseDiceNotation } from "./parseDiceNotation";
import type { SavingThrowModifier } from "@/lib/character/savingThrowModifiers";
import type { SkillModifier } from "@/lib/character/skillModifiers";
import type { SpellAction, WeaponAction } from "@/lib/character/combatActions";
import type {
    AttackThenDamageRequest,
    DamageOnlyRequest,
    DamageStep,
    D20TestRequest,
} from "./rollRequest.types";

export function buildSkillRollRequest(
    skill: SkillModifier,
    label: string
): D20TestRequest {
    return {
        kind: "d20_test",
        id: `skill:${skill.slug}`,
        label,
        die: 20,
        modifier: skill.modifier,
    };
}

export function buildSavingThrowRollRequest(
    save: SavingThrowModifier,
    label: string
): D20TestRequest {
    return {
        kind: "d20_test",
        id: `save:${save.stat}`,
        label,
        die: 20,
        modifier: save.modifier,
    };
}

function toDamageStep(
    diceNotation: string,
    flat: number,
    damageType?: string
): DamageStep {
    const parsed = parseDiceNotation(diceNotation);

    if (parsed.count !== 1) {
        throw new Error(
            `Attack damage expects a single die notation, got ${diceNotation}`
        );
    }

    return {
        sides: parsed.sides as DieSides,
        flat: flat === 0 ? undefined : flat,
        damageType,
    };
}

function expandDamageSteps(
    diceNotation: string,
    damageType?: string
): DamageStep[] {
    const parsed = parseDiceNotation(diceNotation);

    return Array.from({ length: parsed.count }, () => ({
        sides: parsed.sides as DieSides,
        damageType,
    }));
}

export function buildWeaponAttackRollRequest(
    weapon: WeaponAction
): AttackThenDamageRequest | null {
    if (
        weapon.attackModifier === null ||
        !weapon.damageDice ||
        weapon.damageFlat === undefined
    ) {
        return null;
    }

    return {
        kind: "attack_then_damage",
        id: weapon.id,
        label: weapon.name,
        attack: {
            die: 20,
            modifier: weapon.attackModifier,
        },
        damage: toDamageStep(
            weapon.damageDice,
            weapon.damageFlat,
            weapon.damageType
        ),
    };
}

export function buildSpellAttackRollRequest(
    spell: SpellAction
): AttackThenDamageRequest | null {
    if (
        spell.rollProfile?.mode !== "attack" ||
        spell.attackModifier === null
    ) {
        return null;
    }

    return {
        kind: "attack_then_damage",
        id: spell.id,
        label: spell.name,
        attack: {
            die: 20,
            modifier: spell.attackModifier,
        },
        damage: toDamageStep(
            spell.rollProfile.damageDice,
            0,
            spell.rollProfile.damageType
        ),
    };
}

export function buildSpellDamageRollRequest(
    spell: SpellAction
): DamageOnlyRequest | null {
    if (spell.rollProfile?.mode !== "save") {
        return null;
    }

    return {
        kind: "damage_only",
        id: spell.id,
        label: spell.name,
        saveDc: spell.saveDcValue ?? undefined,
        saveAbility: spell.rollProfile.saveAbility,
        steps: expandDamageSteps(
            spell.rollProfile.damageDice,
            spell.rollProfile.damageType
        ),
    };
}

export function resolveD20TestTotal(
    request: D20TestRequest,
    dieValue: number
): number {
    return dieValue + request.modifier;
}

export function resolveAttackRollTotal(
    request: AttackThenDamageRequest,
    dieValue: number
): number {
    return dieValue + request.attack.modifier;
}

export function resolveAttackThenDamageTotal(
    request: AttackThenDamageRequest,
    attackValue: number,
    damageValue: number
): { attackTotal: number; damageTotal: number } {
    const attackTotal = resolveAttackRollTotal(request, attackValue);
    const damageTotal = damageValue + (request.damage.flat ?? 0);

    return { attackTotal, damageTotal };
}

export function resolveDamageOnlyTotal(
    steps: DamageStep[],
    values: number[]
): number {
    if (values.length !== steps.length) {
        throw new Error("Damage roll count does not match step count");
    }

    return values.reduce(
        (total, value, index) => total + value + (steps[index]?.flat ?? 0),
        0
    );
}
