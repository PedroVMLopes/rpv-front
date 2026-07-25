import type { Open5eSpell } from "../open5e/open5e.types";
import type { SpellCatalogEntry } from "./spell.types";

export function mapOpen5eSpell(api: Open5eSpell): SpellCatalogEntry {
    return {
        slug: api.slug,
        language: "en",
        name: api.name,
        levelInt: api.level_int,
        level: api.level,
        school: api.school,
        castingTime: api.casting_time,
        range: api.range,
        components: api.components,
        material: api.material ?? "",
        duration: api.duration,
        requiresConcentration: api.requires_concentration,
        canBeCastAsRitual: api.can_be_cast_as_ritual,
        description: api.desc,
        shortDescription: "",
        higherLevel: api.higher_level,
        spellLists: api.spell_lists ?? [],
        archetype: api.archetype ?? "",
        page: api.page ?? "",
        sourceDocument: api.document__slug ?? "",
        sourceDocumentTitle: api.document__title ?? "",
    };
}
