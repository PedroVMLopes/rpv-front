import type { Locale } from "@rpv/domain";
import * as bundled from "../catalog/bundled";
import * as curationReaders from "../curation/curationReaders";
import type { ContentRepository } from "./contentRepository.types";

export class StaticContentRepository implements ContentRepository {
    readonly system = "dnd";

    listRaces(locale?: Locale) {
        return bundled.listRaces(locale);
    }

    getRace(slug: string, locale?: Locale) {
        return bundled.getRace(slug, locale);
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

    listBackgrounds() {
        return curationReaders.readListBackgrounds();
    }

    getBackground(slug: string) {
        return curationReaders.readBackground(slug);
    }

    listItems(locale?: Locale) {
        return curationReaders.readListItems(locale);
    }

    getItem(slug: string, locale?: Locale) {
        return curationReaders.readItem(slug, locale);
    }

    listSubclassesForClass(classSlug: string, locale?: Locale) {
        return curationReaders.readListSubclassesForClass(classSlug, locale);
    }

    getSubclass(slug: string, locale?: Locale) {
        return curationReaders.readSubclass(slug, locale);
    }
}
