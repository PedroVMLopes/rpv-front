import type { ItemSystem } from "../item/item.types";

export type CurrencyDenomination = {
    ref: string;
    abbreviation: string;
    labelKey: string;
    /** Value in the system's smallest coin (copper for D&D 5e). */
    valueInCopper: number;
};

/** PHB order: highest denomination first. */
export const dndCurrencies: CurrencyDenomination[] = [
    {
        ref: "platinum",
        abbreviation: "pp",
        labelKey: "fields.platinum",
        valueInCopper: 1000,
    },
    {
        ref: "gold",
        abbreviation: "gp",
        labelKey: "fields.gold",
        valueInCopper: 100,
    },
    {
        ref: "electrum",
        abbreviation: "ep",
        labelKey: "fields.electrum",
        valueInCopper: 50,
    },
    {
        ref: "silver",
        abbreviation: "sp",
        labelKey: "fields.silver",
        valueInCopper: 10,
    },
    {
        ref: "copper",
        abbreviation: "cp",
        labelKey: "fields.copper",
        valueInCopper: 1,
    },
];

export function getCurrencies(system: ItemSystem = "dnd"): CurrencyDenomination[] {
    if (system === "dnd") {
        return dndCurrencies;
    }

    return [];
}

export function getCurrency(
    ref: string,
    system: ItemSystem = "dnd"
): CurrencyDenomination | undefined {
    return getCurrencies(system).find((entry) => entry.ref === ref);
}
