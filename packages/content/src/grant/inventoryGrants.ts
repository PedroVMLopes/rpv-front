import { readItem } from "../curation/curationReaders";
import type { ItemSystem } from "../curation/itemGrants.dnd";
import type { Locale } from "@rpv/domain";
import type { Grant, GrantOption } from "./grant.types";

export type InventoryItemGrantEntry = {
    slug: string;
    quantity: number;
    grantIndex: number;
    provenance?: string;
};

export type InventoryGrantResolveContext = {
    sourceType: string;
    sourceId: string;
    featureLevel?: number;
    system?: ItemSystem;
};

export type InventoryItemChoiceGrant = {
    key: string;
    grant: Grant;
    grantIndex: number;
    slot: number;
    label: string;
};

function coerceItemSlug(ref: unknown): string | undefined {
    if (typeof ref !== "string") {
        return undefined;
    }

    const slug = ref.trim().toLowerCase();
    return slug.length > 0 ? slug : undefined;
}

function levelSegment(featureLevel?: number): string {
    return featureLevel !== undefined ? String(featureLevel) : "base";
}

export function buildInventoryItemChoiceKey(params: {
    sourceType: string;
    sourceId: string;
    grantIndex: number;
    slot: number;
    featureLevel?: number;
}): string {
    const segment = levelSegment(params.featureLevel);
    return `${params.sourceType}:${params.sourceId}:${segment}:inventory_item:${params.grantIndex}:${params.slot}`;
}

export function inventoryGrantProvenance(
    sourceType: string,
    sourceId: string,
    grantIndex: number
): string {
    return `grant:${sourceType}:${sourceId}:${grantIndex}`;
}

export function flattenGrantOptionToEntries(
    option: GrantOption
): Array<{ slug: string; quantity: number }> {
    if (option.optionType === "item") {
        const slug = coerceItemSlug(option.ref);
        if (!slug) {
            return [];
        }

        const quantity =
            typeof option.amount === "number" && option.amount >= 1
                ? Math.floor(option.amount)
                : 1;

        return [{ slug, quantity }];
    }

    if (option.optionType === "inventory_bundle") {
        return option.items.flatMap((item) => {
            const slug = coerceItemSlug(item.ref);
            if (!slug) {
                return [];
            }

            const quantity =
                typeof item.amount === "number" && item.amount >= 1
                    ? Math.floor(item.amount)
                    : 1;

            return [{ slug, quantity }];
        });
    }

    return [];
}

type InventoryBundleOption = Extract<
    GrantOption,
    { optionType: "inventory_bundle" }
>;

export function formatInventoryBundleLabel(
    option: InventoryBundleOption,
    system: ItemSystem = "dnd",
    locale?: Locale
): string {
    const explicit = option.label?.trim();
    if (explicit) {
        return explicit;
    }

    const names = option.items
        .map((item) => readItem(item.ref, locale)?.name ?? item.ref)
        .filter((name) => name.length > 0);

    return names.length > 0 ? names.join(" + ") : "Bundle";
}

function parseOptionIndex(pickValue: string | undefined): number | undefined {
    if (pickValue === undefined || pickValue.trim() === "") {
        return undefined;
    }

    const index = Number.parseInt(pickValue, 10);
    if (!Number.isFinite(index) || index < 0) {
        return undefined;
    }

    return index;
}

export function resolveInventoryItemPick(
    grant: Grant,
    pickValue: string | undefined
): Array<{ slug: string; quantity: number }> {
    if (grant.grantType !== "inventory_item" || grant.choose <= 0) {
        return [];
    }

    const optionIndex = parseOptionIndex(pickValue);
    if (optionIndex === undefined) {
        return [];
    }

    const option = grant.options?.[optionIndex];
    if (!option) {
        return [];
    }

    return flattenGrantOptionToEntries(option);
}

export function isValidInventoryItemPick(
    grant: Grant,
    pickValue: string,
    system: ItemSystem = "dnd"
): boolean {
    if (grant.grantType !== "inventory_item" || grant.choose <= 0) {
        return false;
    }

    const entries = resolveInventoryItemPick(grant, pickValue);
    if (entries.length === 0) {
        return false;
    }

    return entries.every((entry) => readItem(entry.slug) !== undefined);
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

export function collectInventoryItemChoiceGrants(
    grants: Grant[],
    source: { type: string; id: string },
    featureLevel?: number
): InventoryItemChoiceGrant[] {
    const results: InventoryItemChoiceGrant[] = [];

    grants.forEach((grant, grantIndex) => {
        if (grant.grantType !== "inventory_item" || grant.choose <= 0) {
            return;
        }

        const baseLabel =
            grant.description?.trim() || "Starting equipment choice";

        for (let slot = 0; slot < grant.choose; slot++) {
            const label =
                grant.choose > 1
                    ? `${baseLabel} (${slot + 1}/${grant.choose})`
                    : baseLabel;

            results.push({
                key: buildInventoryItemChoiceKey({
                    sourceType: source.type,
                    sourceId: source.id,
                    grantIndex,
                    slot,
                    featureLevel,
                }),
                grant,
                grantIndex,
                slot,
                label,
            });
        }
    });

    return results;
}

export function resolveInventoryItemGrants(
    grants: Grant[],
    grantPicks: Record<string, string>,
    context: InventoryGrantResolveContext
): InventoryItemGrantEntry[] {
    const entries: InventoryItemGrantEntry[] = [];
    const system = context.system ?? "dnd";

    grants.forEach((grant, grantIndex) => {
        if (grant.grantType !== "inventory_item") {
            return;
        }

        const provenance = inventoryGrantProvenance(
            context.sourceType,
            context.sourceId,
            grantIndex
        );

        if (grant.choose === 0) {
            const slug = coerceItemSlug(grant.ref);
            if (!slug) {
                return;
            }

            const quantity =
                typeof grant.amount === "number" && grant.amount >= 1
                    ? Math.floor(grant.amount)
                    : 1;

            entries.push({ slug, quantity, grantIndex, provenance });
            return;
        }

        for (let slot = 0; slot < grant.choose; slot++) {
            const key = buildInventoryItemChoiceKey({
                sourceType: context.sourceType,
                sourceId: context.sourceId,
                grantIndex,
                slot,
                featureLevel: context.featureLevel,
            });
            const pickValue = grantPicks[key];
            const resolved = resolveInventoryItemPick(grant, pickValue);

            for (const item of resolved) {
                if (readItem(item.slug) === undefined) {
                    continue;
                }

                entries.push({
                    slug: item.slug,
                    quantity: item.quantity,
                    grantIndex,
                    provenance,
                });
            }
        }
    });

    return entries;
}
