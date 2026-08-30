export * from "./open5e/open5e.types";
export * from "./open5e/open5e.client";

export * from "./spell/spell.types";
export * from "./spell/spell.mapper";
export * from "./spell/classSpellList";

export * from "./grant/grant.types";
export * from "./grant/levelFeature.types";
export * from "./grant/levelFeatures";
export * from "./grant/grants";
export * from "./grant/inventoryGrants";
export * from "./grant/currencyGrants";
export * from "./grant/abilityScoreGrants";
export * from "./grant/exclusiveGroups";

export * from "./feat/feat.types";
export * from "./condition/condition.types";
export * from "./race/race.types";
export * from "./race/ability";
export * from "./race/trait.parser";
export * from "./race/race.mapper";

export * from "./item/item.types";
export * from "./item/item.mapper";
export * from "./item/weaponProficiency";
export * from "./item/armorProficiency";

export * from "./catalog/catalog.types";
export * from "./catalog/skills.seed";
export * from "./catalog/savingThrows.seed";
export * from "./catalog/languages.seed";

export * from "./curation/raceGrants.dnd";
export * from "./curation/flavorTable.types";
export * from "./curation/backgroundGrants.dnd";
export * from "./curation/itemGrants.dnd";
export * from "./curation/itemOverlays.dnd";
export * from "./curation/equipmentPacks.dnd";
export * from "./curation/equipmentSlots.dnd";
export * from "./curation/currencies.dnd";
export * from "./curation/equipmentSlotAffinity.dnd";
export * from "./curation/classGrants.dnd";
export * from "./curation/subclassGrants.dnd";
export * from "./curation/systemGrants.dnd";
export * from "./curation/naturalWeapons.dnd";
export * from "./curation/conditions.dnd";
export * from "./curation/featureDescriptions.dnd";
export * from "./curation/spellCombat.dnd";
export * from "./curation/spellDisplay.dnd";
export * from "./curation/spellShortDescriptions.dnd";
export * from "./spell/castingTime";

export {
    getClass,
    listClasses,
    getBackground,
    listBackgrounds,
    getItem,
    listItems,
    getSubclass,
    listSubclassesForClass,
    listRaces,
    getRace,
    getSubrace,
    listSpells,
    getSpell,
    listLanguages,
    getLanguage,
    listFeats,
    getFeat,
    listConditions,
    getCondition,
} from "./curation/contentRepoWrappers.dnd";

export type { ContentRepository } from "./repository/contentRepository.types";
export { StaticContentRepository } from "./repository/staticContentRepository";
export { getContentRepository } from "./repository/getContentRepository";

export { catalog } from "./catalog/bundled";

export {
    getClassGrantSourcesForLevel,
    getClassGrants,
    getClassHitDie,
    getClassSpellcastingMode,
    getClassPreparedQuotaKind,
    getClassSubclassLevel,
    classGrantSourcesFromEntry,
} from "./grant/classGrantSources";

export {
    getSubclassGrantSourcesForLevel,
    getSubclassGrants,
    subclassGrantSourcesFromEntry,
} from "./grant/subclassGrantSources";

export { getBackgroundGrants } from "./grant/backgroundGrantSources";
