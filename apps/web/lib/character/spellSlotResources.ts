export type SpellSlotResource = {
    ref: string;
    level: number;
    count: number;
};

const SPELL_SLOT_REF_PREFIX = "spell-slots-";

export function listSpellSlotResources(
    resources: Record<string, number>
): SpellSlotResource[] {
    return Object.entries(resources)
        .flatMap(([ref, count]) => {
            if (!ref.startsWith(SPELL_SLOT_REF_PREFIX) || count <= 0) {
                return [];
            }

            const level = Number.parseInt(
                ref.slice(SPELL_SLOT_REF_PREFIX.length),
                10
            );
            if (!Number.isFinite(level)) {
                return [];
            }

            return [{ ref, level, count }];
        })
        .sort((a, b) => a.level - b.level);
}
