import type { ItemEntry } from "./item.types";

function stripItemNamespace(value: string): string {
    return value.replace(/^(srd_|rpv_)/, "");
}

function normalizeProficiencyToken(value: string): string {
    return value.trim().toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
}

function expandProficiencyTokens(ref: string): string[] {
    const normalized = normalizeProficiencyToken(ref);
    const tokens = new Set<string>([normalized]);

    if (
        normalized.endsWith("s") &&
        !normalized.endsWith("ss") &&
        !normalized.endsWith("us")
    ) {
        tokens.add(normalized.slice(0, -1));
    } else {
        tokens.add(`${normalized}s`);
    }

    return [...tokens];
}

function itemWeaponTokens(item: ItemEntry): string[] {
    const raw = [
        item.slug,
        item.weapon?.key,
        item.weapon?.name,
    ].filter((value): value is string => Boolean(value));

    const tokens = new Set<string>();

    for (const value of raw) {
        const normalized = normalizeProficiencyToken(value);
        tokens.add(normalized);
        tokens.add(stripItemNamespace(normalized));
    }

    return [...tokens];
}

/**
 * True when any proficiency ref covers this weapon: category
 * (`simple-weapons` / `martial-weapons`) or a specific weapon name/slug
 * (`longsword`, `longswords`, `srd_longsword`).
 */
export function itemMatchesWeaponProficiency(
    item: ItemEntry,
    refs: Iterable<string>
): boolean {
    if (!item.weapon) {
        return false;
    }

    const refList = [...refs];

    if (item.weapon.isMartial && refList.includes("martial-weapons")) {
        return true;
    }

    if (item.weapon.isSimple && refList.includes("simple-weapons")) {
        return true;
    }

    const weaponTokens = itemWeaponTokens(item);

    for (const ref of refList) {
        if (ref === "simple-weapons" || ref === "martial-weapons") {
            continue;
        }

        const forms = expandProficiencyTokens(ref);
        if (weaponTokens.some((token) => forms.includes(token))) {
            return true;
        }
    }

    return false;
}
