import type { SpellDisplayMeta } from "../spell/spell.types";

const dndSpellDisplayMeta: Record<string, SpellDisplayMeta> = {
    "acid-splash": { targetKind: "multiple" },
    "burning-hands": { targetKind: "area" },
    "detect-magic": { targetKind: "self" },
    "feather-fall": { targetKind: "multiple" },
    "fire-bolt": { targetKind: "single" },
    identify: { targetKind: "touch", actionCost: "minute" },
    light: { targetKind: "touch" },
    "mage-armor": { targetKind: "touch" },
    "mage-hand": { targetKind: "single" },
    "magic-missile": { targetKind: "multiple" },
    shield: { targetKind: "self", actionCost: "reaction" },
    sleep: { targetKind: "area" },
};

export function getSpellDisplayMeta(slug: string): SpellDisplayMeta | undefined {
    return dndSpellDisplayMeta[slug];
}

export function listSpellDisplayMetaSlugs(): string[] {
    return Object.keys(dndSpellDisplayMeta);
}
