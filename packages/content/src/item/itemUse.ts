import type { Grant } from "../grant/grant.types";
import type { ItemEntry } from "./item.types";

/**
 * Grants on an item that declare an activatable use effect (scrolls, potions).
 * Requires both `activation` and `useEffect`.
 */
export function listItemUseGrants(item: ItemEntry): Grant[] {
    return item.grants.filter(
        (grant) =>
            grant.grantType === "ability" &&
            grant.activation != null &&
            grant.useEffect != null
    );
}

/**
 * True when the item has at least one use grant that consumes inventory qty.
 */
export function isConsumableItem(item: ItemEntry): boolean {
    return listItemUseGrants(item).some(
        (grant) =>
            grant.activation?.consumeQuantity != null &&
            grant.activation.consumeQuantity > 0
    );
}
