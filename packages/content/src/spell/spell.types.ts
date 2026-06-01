export interface SpellCatalogEntry {
    slug: string;
    name: string;
    levelInt: number;
    level: string;
    school: string;
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    requiresConcentration: boolean;
    canBeCastAsRitual: boolean;
    description: string;
    higherLevel: string;
    spellLists: string[];
    sourceDocument: string;
}
