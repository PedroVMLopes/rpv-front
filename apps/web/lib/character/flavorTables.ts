import type { FlavorTable } from "@rpv/content";

export const FLAVOR_SLOT_SEPARATOR = "\n";
export const FLAVOR_CUSTOM_SENTINEL = "__custom__";

export type BoundFlavorTable = FlavorTable & { bindTo: string };

export type FlavorTableSource = {
    flavorTables?: FlavorTable[];
};

export function isBoundFlavorTable(
    table: FlavorTable
): table is BoundFlavorTable {
    return typeof table.bindTo === "string" && table.bindTo.trim() !== "";
}

export function boundFlavorTables(
    entry: FlavorTableSource | undefined
): BoundFlavorTable[] {
    return (entry?.flavorTables ?? []).filter(isBoundFlavorTable);
}

export function joinFlavorSlots(slots: string[]): string {
    const copy = [...slots];
    while (copy.length > 0 && copy[copy.length - 1].trim() === "") {
        copy.pop();
    }
    return copy.join(FLAVOR_SLOT_SEPARATOR);
}

export function parseFlavorSlots(value: unknown, pickCount: number): string[] {
    const raw = typeof value === "string" ? value : "";
    const count = Math.max(pickCount, 1);

    if (count === 1) {
        return [raw];
    }

    const lines = raw.split(FLAVOR_SLOT_SEPARATOR);
    return Array.from({ length: count }, (_, index) => {
        if (index < count - 1) {
            return lines[index] ?? "";
        }

        return lines.slice(index).join(FLAVOR_SLOT_SEPARATOR);
    });
}

export function flavorFieldMatchesTable(
    value: unknown,
    table: FlavorTable
): boolean {
    if (typeof value !== "string") {
        return false;
    }

    const labels = new Set(table.options.map((option) => option.label));
    const lines = parseFlavorSlots(value, table.pickCount)
        .map((line) => line.trim())
        .filter((line) => line !== "");

    if (lines.length === 0) {
        return false;
    }

    return lines.every((line) => labels.has(line));
}

export function sanitizeFlavorFieldsOnBackgroundChange({
    previous,
    next: _next,
    values,
}: {
    previous?: FlavorTableSource;
    next?: FlavorTableSource;
    values: Record<string, unknown>;
}): Record<string, string> {
    const patch: Record<string, string> = {};

    for (const table of boundFlavorTables(previous)) {
        const current = values[table.bindTo];
        if (flavorFieldMatchesTable(current, table)) {
            patch[table.bindTo] = "";
        }
    }

    return patch;
}

export function selectValueForFlavorSlot(
    slotText: string,
    table: FlavorTable
): string {
    const trimmed = slotText.trim();
    if (!trimmed) {
        return "";
    }

    const option = table.options.find((entry) => entry.label === trimmed);
    if (option) {
        return option.slug;
    }

    return table.allowCustom ? FLAVOR_CUSTOM_SENTINEL : "";
}

export function flavorSlotTextFromSelect(
    selectValue: string,
    table: FlavorTable,
    customText: string
): string {
    if (selectValue === "" || selectValue === FLAVOR_CUSTOM_SENTINEL) {
        return selectValue === FLAVOR_CUSTOM_SENTINEL ? customText : "";
    }

    return table.options.find((option) => option.slug === selectValue)?.label ?? "";
}
