import type { Grant } from "../grant/grant.types";

export const DND_BASIC_COMBAT_SOURCE_ID = "dnd-basic-combat";

const dndBasicCombatGrants: Grant[] = [
    {
        grantType: "ability",
        choose: 0,
        description: "Grapple",
        activation: { cost: "action" },
    },
    {
        grantType: "ability",
        choose: 0,
        description: "Shove",
        activation: { cost: "action" },
    },
    {
        grantType: "ability",
        choose: 0,
        description: "Dash",
        activation: { cost: "action" },
    },
    {
        grantType: "ability",
        choose: 0,
        description: "Disengage",
        activation: { cost: "action" },
    },
    {
        grantType: "ability",
        choose: 0,
        description: "Dodge",
        activation: { cost: "action" },
    },
    {
        grantType: "ability",
        choose: 0,
        description: "Help",
        activation: { cost: "action" },
    },
    {
        grantType: "ability",
        choose: 0,
        description: "Hide",
        activation: { cost: "action" },
    },
    {
        grantType: "ability",
        choose: 0,
        description: "Opportunity Attack",
        activation: { cost: "reaction" },
    },
];

/** Universal combat actions for a content system. Empty when the system has none. */
export function getSystemCombatGrants(system: string): Grant[] {
    if (system !== "dnd") {
        return [];
    }

    return dndBasicCombatGrants;
}
