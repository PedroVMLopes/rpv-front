export type {
    ItemArmor,
    ItemCategoryRef,
    ItemEntry,
    ItemSystem,
    ItemWeapon,
    ItemWeaponProperty,
} from "../item/item.types";
export { isItemStackable } from "../item/item.types";

import type { Grant } from "../grant/grant.types";
import type { ItemSystem } from "../item/item.types";
import { getContentRepository } from "../repository/getContentRepository";

export function getItemGrants(slug: string, system: ItemSystem = "dnd"): Grant[] {
    if (system !== "dnd") {
        return [];
    }
    return getContentRepository("dnd").getItem(slug)?.grants ?? [];
}
