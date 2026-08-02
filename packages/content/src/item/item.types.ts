import type { Grant } from "../grant/grant.types";

export type ItemSystem = "dnd";

export type ItemCategoryRef = {
    name: string;
    key: string;
};

export type ItemWeaponProperty = {
    name: string;
    type: string | null;
    description: string;
    detail: string | null;
};

export type ItemWeapon = {
    key: string;
    name: string;
    damageDice: string;
    damageType: { name: string; key: string };
    properties: ItemWeaponProperty[];
    isSimple: boolean;
    isMartial: boolean;
    isImprovised: boolean;
    distanceUnit: string | null;
    range?: number | null;
    longRange?: number | null;
};

export type ItemArmor = {
    key: string;
    name: string;
    category: string;
    acBase: number;
    acDisplay: string;
    acAddDexmod: boolean;
    acCapDexmod: number | null;
    grantsStealthDisadvantage: boolean;
    strengthScoreRequired: number | null;
};

/**
 * Catalog item aligned with Open5e v2 `/items/` shape (camelCase).
 * `slug` is the Open5e `key` (e.g. `srd_longsword`) or an RPV overlay id (`rpv_*`).
 */
export interface ItemEntry {
    slug: string;
    system: ItemSystem;
    name: string;
    description: string;
    category: ItemCategoryRef;
    weapon: ItemWeapon | null;
    armor: ItemArmor | null;
    weight: string | null;
    weightUnit: string | null;
    cost: string | null;
    grants: Grant[];
    stackable: boolean;
}

export function isItemStackable(entry: ItemEntry): boolean {
    return entry.stackable !== false;
}
