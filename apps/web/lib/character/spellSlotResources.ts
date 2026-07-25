export type SpellSlotResource = {
    ref: string;
    level: number;
    count: number;
};

export const SPELL_SLOT_REF_PREFIX = "spell-slots-";

export function parseSpellSlotLevel(ref: string): number | undefined {
    if (!ref.startsWith(SPELL_SLOT_REF_PREFIX)) {
        return undefined;
    }

    const level = Number.parseInt(ref.slice(SPELL_SLOT_REF_PREFIX.length), 10);
    return Number.isFinite(level) ? level : undefined;
}

export function listSpellSlotResources(
    resources: Record<string, number>
): SpellSlotResource[] {
    return Object.entries(resources)
        .flatMap(([ref, count]) => {
            const level = parseSpellSlotLevel(ref);
            if (level === undefined || count <= 0) {
                return [];
            }

            return [{ ref, level, count }];
        })
        .sort((a, b) => a.level - b.level);
}

export type SpellSlotLabelTranslate = (
    key: "spellSlotsGrouped" | "spellSlotsGroupedDelta",
    values: { level: number; count: number }
) => string;

export function formatSpellSlotResourceLabel(
    level: number,
    count: number,
    translate: SpellSlotLabelTranslate,
    options?: { signed?: boolean }
): string {
    const key = options?.signed ? "spellSlotsGroupedDelta" : "spellSlotsGrouped";
    return translate(key, { level, count: Math.abs(count) });
}
