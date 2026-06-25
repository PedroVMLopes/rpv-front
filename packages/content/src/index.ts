export * from "./open5e/open5e.types";
export * from "./open5e/open5e.client";

export * from "./spell/spell.types";
export * from "./spell/spell.mapper";

export * from "./grant/grant.types";
export * from "./grant/levelFeature.types";
export * from "./grant/levelFeatures";
export * from "./grant/grants";
export * from "./grant/inventoryGrants";
export * from "./grant/currencyGrants";
export * from "./grant/abilityScoreGrants";
export * from "./grant/exclusiveGroups";

export * from "./race/race.types";
export * from "./race/ability";
export * from "./race/trait.parser";
export * from "./race/race.mapper";

export * from "./catalog/catalog.types";
export * from "./catalog/skills.seed";
export * from "./catalog/savingThrows.seed";
export * from "./catalog/languages.seed";

export * from "./curation/raceGrants.dnd";
export * from "./curation/backgroundGrants.dnd";
export * from "./curation/itemGrants.dnd";
export * from "./curation/equipmentSlots.dnd";
export * from "./curation/classGrants.dnd";
export * from "./curation/subclassGrants.dnd";

export {
    getClass,
    listClasses,
    getBackground,
    listBackgrounds,
    getItem,
    listItems,
    getSubclass,
    listSubclassesForClass,
} from "./curation/contentRepoWrappers.dnd";

export type { ContentRepository } from "./repository/contentRepository.types";
export { StaticContentRepository } from "./repository/staticContentRepository";
export { getContentRepository } from "./repository/getContentRepository";

export {
    catalog,
    listRaces,
    getRace,
    getSubrace,
    listSpells,
    getSpell,
    listLanguages,
    getLanguage,
} from "./catalog/bundled";
