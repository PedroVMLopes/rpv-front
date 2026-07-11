import type { Grant } from "@rpv/content";

export type ParsedGrantPickKey = {
    sourceType: string;
    sourceId: string;
    levelSegment: string;
    grantType: string;
    grantIndex: string;
    slot: string;
};

export function parseGrantPickKey(key: string): ParsedGrantPickKey | undefined {
    const parts = key.split(":");

    if (parts.length < 6) {
        return undefined;
    }

    return {
        sourceType: parts[0] ?? "",
        sourceId: parts[1] ?? "",
        levelSegment: parts[2] ?? "",
        grantType: parts[3] ?? "",
        grantIndex: parts[4] ?? "",
        slot: parts[5] ?? "",
    };
}

export function featureLevelFromGrantPickKey(key: string): number {
    const parsed = parseGrantPickKey(key);

    if (!parsed) {
        return 1;
    }

    if (parsed.levelSegment === "base" || parsed.levelSegment === "exclusive") {
        return 1;
    }

    const level = Number(parsed.levelSegment);

    return Number.isFinite(level) && level >= 1 ? Math.floor(level) : 1;
}

export function isGrantPickAboveProgressionCap(
    key: string,
    cap: number
): boolean {
    const parsed = parseGrantPickKey(key);

    if (!parsed) {
        return false;
    }

    if (parsed.levelSegment === "base" || parsed.levelSegment === "exclusive") {
        return false;
    }

    const level = Number(parsed.levelSegment);

    return Number.isFinite(level) && level > cap;
}

export function isCantripGrant(grant: Grant): boolean {
    if (grant.grantType !== "spell") {
        return false;
    }

    return grant.selectionFilter?.levelInt === 0;
}

export function isLeveledSpellGrant(grant: Grant): boolean {
    if (grant.grantType !== "spell") {
        return false;
    }

    const levelInt = grant.selectionFilter?.levelInt;

    return levelInt !== undefined && levelInt > 0;
}

export function isInventoryOrExclusiveKey(key: string): boolean {
    return (
        key.includes(":inventory_item:") ||
        key.includes(":currency:") ||
        key.includes(":exclusive:")
    );
}
