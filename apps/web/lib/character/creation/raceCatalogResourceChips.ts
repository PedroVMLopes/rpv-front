import type { CatalogSelectionMetadata } from "./catalogSelection.types";

export type ResourcePreviewChip = {
    id: string;
    label: string;
};

export function parseDarkvisionRangeFeet(visionDesc: string): number | undefined {
    const match = visionDesc.match(/(\d+)\s*feet/i);

    if (!match) {
        return undefined;
    }

    const range = Number(match[1]);

    return Number.isFinite(range) && range > 0 ? range : undefined;
}

export function hasDarkvision(visionDesc: string | undefined): boolean {
    return Boolean(visionDesc?.trim() && /darkvision/i.test(visionDesc));
}

export function buildRaceResourcePreviewChips(
    metadata: CatalogSelectionMetadata | undefined,
    labels: {
        speed: (speed: number) => string;
        darkvision: () => string;
        darkvisionWithRange: (range: number) => string;
    }
): ResourcePreviewChip[] {
    const chips: ResourcePreviewChip[] = [];

    if (metadata?.speedWalk !== undefined && metadata.speedWalk > 0) {
        chips.push({
            id: "speed",
            label: labels.speed(metadata.speedWalk),
        });
    }

    if (hasDarkvision(metadata?.visionDesc)) {
        const range = parseDarkvisionRangeFeet(metadata!.visionDesc!);

        chips.push({
            id: "darkvision",
            label:
                range !== undefined
                    ? labels.darkvisionWithRange(range)
                    : labels.darkvision(),
        });
    }

    return chips;
}
