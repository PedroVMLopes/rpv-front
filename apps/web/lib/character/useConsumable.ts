import { toast } from "sonner";
import type { ContentUseActionSpec } from "@/lib/content/contentDetail.types";
import type { ConsumableAction } from "@/lib/character/consumableActions";
import {
    buildHealRollRequest,
    buildSpellAttackOnlyRollRequest,
    buildSpellDamageRollRequest,
} from "@/lib/roll/buildRollRequest";
import type { RollRequest } from "@/lib/roll/rollRequest.types";
import { contentRepo } from "@/lib/content/contentRepository";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";

export type PerformConsumableUseParams = {
    action: ConsumableAction;
    useAction: ContentUseActionSpec;
    allUseActions?: ContentUseActionSpec[];
    system: SystemKey | string;
    locale?: Locale;
    characterId: string;
    openRollRequest: (request: RollRequest) => void;
    /** Called when inventory should be decremented. */
    consume: (itemSlug: string, quantity: number) => void;
    /** Optional concentration setter for concentration spells. */
    setConcentration?: (payload: {
        slug: string;
        slotLevel?: number;
    }) => void;
    castLabel?: string;
    /** Toast for stubbed use effects (apply_condition / deal_damage). */
    manualEffectToast?: (label: string) => void;
};

/**
 * Damage follow-up after a separate attack button does not consume again.
 * Damage-only consumables (no attack button) still consume.
 */
export function shouldConsumeOnUseAction(
    useAction: ContentUseActionSpec,
    allUseActions: ContentUseActionSpec[] = []
): boolean {
    if (useAction.role === "damage") {
        const hasAttack = allUseActions.some(
            (entry) => entry.role === "attack"
        );
        if (hasAttack) {
            return false;
        }
    }
    return true;
}

function maybeConsume(
    action: ConsumableAction,
    useAction: ContentUseActionSpec,
    allUseActions: ContentUseActionSpec[],
    consume: PerformConsumableUseParams["consume"]
): void {
    if (
        action.consumeQuantity > 0 &&
        shouldConsumeOnUseAction(useAction, allUseActions)
    ) {
        consume(action.itemSlug, action.consumeQuantity);
    }
}

/**
 * Apply a consumable use effect and optionally consume bag qty.
 * Returns true when an effect was started successfully.
 */
export function performConsumableUse(
    params: PerformConsumableUseParams
): boolean {
    const {
        action,
        useAction,
        allUseActions = [],
        system,
        locale,
        characterId,
        openRollRequest,
        consume,
        setConcentration,
        castLabel,
        manualEffectToast,
    } = params;

    if (action.depleted) {
        return false;
    }

    const effect = action.useEffect;

    if (effect.kind === "heal") {
        try {
            const request = buildHealRollRequest({
                characterId,
                id: action.id,
                label: action.title,
                dice: effect.dice,
                flat: effect.flat,
                healingKind: effect.healingKind,
            });
            openRollRequest(request);
            maybeConsume(action, useAction, allUseActions, consume);
            return true;
        } catch {
            return false;
        }
    }

    if (effect.kind === "apply_condition" || effect.kind === "deal_damage") {
        manualEffectToast?.(action.title);
        maybeConsume(action, useAction, allUseActions, consume);
        return true;
    }

    if (effect.kind !== "cast_spell" || !action.spell) {
        return false;
    }

    const spell = action.spell;
    let started = false;

    if (useAction.kind === "cast") {
        toast(castLabel ? `${spell.name} (${castLabel})` : spell.name);
        const catalogEntry = contentRepo(system as SystemKey).getSpell(
            spell.slug,
            locale
        );
        if (catalogEntry?.requiresConcentration && setConcentration) {
            setConcentration({ slug: spell.slug });
        }
        started = true;
    } else if (useAction.kind === "roll") {
        if (useAction.role === "attack") {
            const request = buildSpellAttackOnlyRollRequest(spell);
            if (request) {
                openRollRequest(request);
                started = true;
            }
        } else {
            const request = buildSpellDamageRollRequest(spell);
            if (request) {
                openRollRequest(request);
                started = true;
            }
        }
    }

    if (started) {
        maybeConsume(action, useAction, allUseActions, consume);
    }

    return started;
}
