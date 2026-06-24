import type { Grant } from "./grant.types";

export type InventoryItemGrantEntry = {
    slug: string;
    quantity: number;
    grantIndex: number;
};

function coerceItemSlug(ref: unknown): string | undefined {
    if (typeof ref !== "string") {
        return undefined;
    }

    const slug = ref.trim().toLowerCase();
    return slug.length > 0 ? slug : undefined;
}

export function extractInventoryItemGrants(grants: Grant[]): InventoryItemGrantEntry[] {
    const entries: InventoryItemGrantEntry[] = [];

    grants.forEach((grant, grantIndex) => {
        if (grant.grantType !== "inventory_item" || grant.choose !== 0) {
            return;
        }

        const slug = coerceItemSlug(grant.ref);
        if (!slug) {
            return;
        }

        const quantity =
            typeof grant.amount === "number" && grant.amount >= 1
                ? Math.floor(grant.amount)
                : 1;

        entries.push({ slug, quantity, grantIndex });
    });

    return entries;
}

export function inventoryGrantProvenance(
    sourceType: string,
    sourceId: string,
    grantIndex: number
): string {
    return `grant:${sourceType}:${sourceId}:${grantIndex}`;
}
