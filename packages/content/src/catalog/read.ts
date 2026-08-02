import type { Locale } from "@rpv/domain";
import type { ItemEntry } from "../item/item.types";
import type { RaceCatalogEntry, SubraceCatalogEntry } from "../race/race.types";
import type { SpellCatalogEntry } from "../spell/spell.types";
import type {
    Catalog,
    CatalogEntryTranslation,
    CatalogTranslations,
    Language,
} from "./catalog.types";

function applyTranslation<
    T extends {
        slug: string;
        name: string;
        description: string;
        language: Locale;
        shortDescription?: string;
    }
>(
    entry: T,
    overlay: Record<string, CatalogEntryTranslation> | undefined,
    locale: Locale
): T {
    const translation = overlay?.[entry.slug];
    if (!translation) {
        return entry;
    }

    return {
        ...entry,
        name: translation.name ?? entry.name,
        description: translation.description ?? entry.description,
        ...(translation.shortDescription !== undefined ||
        entry.shortDescription !== undefined
            ? {
                  shortDescription:
                      translation.shortDescription ?? entry.shortDescription,
              }
            : {}),
        language: locale,
    };
}

function localizeSubrace(
    subrace: SubraceCatalogEntry,
    translations: CatalogTranslations | undefined,
    locale: Locale
): SubraceCatalogEntry {
    return applyTranslation(subrace, translations?.subraces, locale);
}

function localizeRace(
    race: RaceCatalogEntry,
    translations: CatalogTranslations | undefined,
    locale: Locale
): RaceCatalogEntry {
    const localized = applyTranslation(race, translations?.races, locale);
    return {
        ...localized,
        subraces: localized.subraces.map((sub) =>
            localizeSubrace(sub, translations, locale)
        ),
    };
}

export function listRaces(
    catalog: Catalog,
    locale: Locale = catalog.defaultLocale,
    translations?: CatalogTranslations
): RaceCatalogEntry[] {
    if (locale === catalog.defaultLocale || !translations) {
        return catalog.races;
    }
    return catalog.races.map((race) => localizeRace(race, translations, locale));
}

export function getRace(
    catalog: Catalog,
    slug: string,
    locale: Locale = catalog.defaultLocale,
    translations?: CatalogTranslations
): RaceCatalogEntry | undefined {
    const race = catalog.races.find((entry) => entry.slug === slug);
    if (!race) {
        return undefined;
    }
    if (locale === catalog.defaultLocale || !translations) {
        return race;
    }
    return localizeRace(race, translations, locale);
}

export function getSubrace(
    catalog: Catalog,
    slug: string,
    locale: Locale = catalog.defaultLocale,
    translations?: CatalogTranslations
): SubraceCatalogEntry | undefined {
    for (const race of catalog.races) {
        const subrace = race.subraces.find((sub) => sub.slug === slug);
        if (subrace) {
            if (locale === catalog.defaultLocale || !translations) {
                return subrace;
            }
            return localizeSubrace(subrace, translations, locale);
        }
    }
    return undefined;
}

export function listSpells(
    catalog: Catalog,
    locale: Locale = catalog.defaultLocale,
    translations?: CatalogTranslations
): SpellCatalogEntry[] {
    if (locale === catalog.defaultLocale || !translations) {
        return catalog.spells;
    }
    return catalog.spells.map((spell) =>
        applyTranslation(spell, translations?.spells, locale)
    );
}

export function getSpell(
    catalog: Catalog,
    slug: string,
    locale: Locale = catalog.defaultLocale,
    translations?: CatalogTranslations
): SpellCatalogEntry | undefined {
    const spell = catalog.spells.find((entry) => entry.slug === slug);
    if (!spell) {
        return undefined;
    }
    if (locale === catalog.defaultLocale || !translations) {
        return spell;
    }
    return applyTranslation(spell, translations?.spells, locale);
}

export function listLanguages(catalog: Catalog): Language[] {
    return catalog.languages;
}

export function getLanguage(
    catalog: Catalog,
    slug: string
): Language | undefined {
    return catalog.languages.find((entry) => entry.slug === slug);
}

function localizeItem(
    entry: ItemEntry,
    translations: CatalogTranslations | undefined,
    locale: Locale
): ItemEntry {
    const translation = translations?.items?.[entry.slug];
    if (!translation) {
        return entry;
    }
    return {
        ...entry,
        name: translation.name ?? entry.name,
        description: translation.description ?? entry.description,
    };
}

export function listItems(
    catalog: Catalog,
    locale: Locale = catalog.defaultLocale,
    translations?: CatalogTranslations
): ItemEntry[] {
    const items = catalog.items ?? [];
    if (locale === catalog.defaultLocale || !translations) {
        return items;
    }
    return items.map((item) => localizeItem(item, translations, locale));
}

export function getItem(
    catalog: Catalog,
    slug: string,
    locale: Locale = catalog.defaultLocale,
    translations?: CatalogTranslations
): ItemEntry | undefined {
    const item = (catalog.items ?? []).find((entry) => entry.slug === slug);
    if (!item) {
        return undefined;
    }
    if (locale === catalog.defaultLocale || !translations) {
        return item;
    }
    return localizeItem(item, translations, locale);
}
