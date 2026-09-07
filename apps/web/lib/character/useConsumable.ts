import { toast } from "sonner";
import type { ContentUseActionSpec } from "@/lib/content/contentDetail.types";
import type { ConsumableAction } from "@/lib/character/consumableActions";
import {
    buildSpellAttackOnlyRollRequest,
    buildSpellDamageRollRequest,
} from "@/lib/roll/buildRollRequest";
import type { RollRequest } from "@/lib/roll/rollRequest.types";
import { contentRepo } from "@/lib/content/contentRepository";
import type { Locale } from "@rpv/domain";

export type PerformConsumableUseParams = {
    action: ConsumableAction;
    useAction: ContentUseActionSpec;
    allUseActions?: ContentUseActionSpec[];
    system: string;
    locale?: Locale;
    openRollRequest: (request: RollRequest) => void;
    /** Called when inventory should be decremented. */
    consume: (itemSlug: string, quantity: number) => void;
    /** Optional concentration setter for concentration spells. */
    setConcentration?: (payload: {
        slug: string;
        slotLevel?: number;
    }) => void;
    castLabel?: string;
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

/**
 * Apply a consumable use effect (cast_spell MVP) and optionally consume bag qty.
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
        openRollRequest,
        consume,
        setConcentration,
        castLabel,
    } = params;

    if (action.depleted) {
        return false;
    }

    if (action.useEffect.kind !== "cast_spell" || !action.spell) {
        return false;
    }

    const spell = action.spell;
    let started = false;

    if (useAction.kind === "cast") {
        toast(castLabel ? `${spell.name} (${castLabel})` : spell.name);
        const catalogEntry = contentRepo(system).getSpell(spell.slug, locale);
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

    if (
        started &&
        action.consumeQuantity > 0 &&
        shouldConsumeOnUseAction(useAction, allUseActions)
    ) {
        consume(action.itemSlug, action.consumeQuantity);
    }

    return started;
}
