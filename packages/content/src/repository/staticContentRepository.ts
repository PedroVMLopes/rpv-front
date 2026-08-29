import type { Locale } from "@rpv/domain";
import * as bundled from "../catalog/bundled";
import * as curationReaders from "../curation/curationReaders";
import { dndEquipmentPackBundles } from "../curation/equipmentPacks.dnd";
import { dndEquipmentSlots } from "../curation/equipmentSlots.dnd";
import { localizeNaturalWeaponEntries } from "../curation/naturalWeapons.dnd";
import { dndRaceLevelGrants } from "../curation/raceGrants.dnd";
import {
    DND_BASIC_COMBAT_SOURCE_ID,
    dndBasicCombatGrants,
} from "../curation/systemGrants.dnd";
import type { RaceCatalogEntry } from "../race/race.types";
import type { ContentRepository } from "./contentRepository.types";

function withRaceLevelGrants(
    race: RaceCatalogEntry | undefined
): RaceCatalogEntry | undefined {
    if (!race) {
        return undefined;
    }

    return {
        ...race,
        levelGrants: dndRaceLevelGrants[race.slug] ?? [],
    };
}

export class StaticContentRepository implements ContentRepository {
    readonly system = "dnd";
    readonly systemCombatSourceId = DND_BASIC_COMBAT_SOURCE_ID;

    listRaces(locale?: Locale) {
        return bundled.listRaces(locale).map((race) => withRaceLevelGrants(race)!);
    }

    getRace(slug: string, locale?: Locale) {
        return withRaceLevelGrants(bundled.getRace(slug, locale));
    }

    getSubrace(slug: string, locale?: Locale) {
        return bundled.getSubrace(slug, locale);
    }

    listSpells(locale?: Locale) {
        return bundled.listSpells(locale);
    }

    getSpell(slug: string, locale?: Locale) {
        return bundled.getSpell(slug, locale);
    }

    listLanguages() {
        return bundled.listLanguages();
    }

    getLanguage(slug: string) {
        return bundled.getLanguage(slug);
    }

    listClasses(locale?: Locale) {
        return curationReaders.readListClasses(locale);
    }

    getClass(slug: string, locale?: Locale) {
        return curationReaders.readClass(slug, locale);
    }

    listBackgrounds(locale?: Locale) {
        return curationReaders.readListBackgrounds(locale);
    }

    getBackground(slug: string, locale?: Locale) {
        return curationReaders.readBackground(slug, locale);
    }

    listItems(locale?: Locale) {
        return bundled.listItems(locale);
    }

    getItem(slug: string, locale?: Locale) {
        return bundled.getItem(slug, locale);
    }

    listSubclassesForClass(classSlug: string, locale?: Locale) {
        return curationReaders.readListSubclassesForClass(classSlug, locale);
    }

    getSubclass(slug: string, locale?: Locale) {
        return curationReaders.readSubclass(slug, locale);
    }

    listEquipmentSlots() {
        return dndEquipmentSlots;
    }

    getNaturalWeapons(locale?: Locale) {
        return localizeNaturalWeaponEntries(locale);
    }

    getSystemCombatGrants() {
        return dndBasicCombatGrants;
    }

    getEquipmentPack(key: string) {
        return dndEquipmentPackBundles[key as keyof typeof dndEquipmentPackBundles];
    }

    listFeats(_locale?: Locale) {
        return [];
    }

    getFeat(_slug: string, _locale?: Locale) {
        return undefined;
    }

    listConditions(locale?: Locale) {
        return curationReaders.readListConditions(locale);
    }

    getCondition(slug: string, locale?: Locale) {
        return curationReaders.readCondition(slug, locale);
    }
}
