import type { Locale, StatKey } from "@rpv/domain";
import type { RaceCatalogEntry } from "../race/race.types";
import type { SpellCatalogEntry } from "../spell/spell.types";

export interface Skill {
    slug: string;
    name: string;
    ability: StatKey;
}

export interface Language {
    slug: string;
    name: string;
    type: "standard" | "exotic";
    script?: string;
}

export interface Catalog {
    generatedAt: string;
    source: "open5e";
    /** Language the base catalog text is authored in. */
    defaultLocale: Locale;
    races: RaceCatalogEntry[];
    spells: SpellCatalogEntry[];
    skills: Skill[];
    languages: Language[];
}

/** Translated text for a single catalog entry, keyed by the entry's slug. */
export interface CatalogEntryTranslation {
    name?: string;
    description?: string;
}

/**
 * Locale overlay applied on top of the base catalog. Entries are partial: any
 * missing slug or field falls back to the base (English) text so partially
 * translated content never renders blank.
 */
export interface CatalogTranslations {
    races?: Record<string, CatalogEntryTranslation>;
    subraces?: Record<string, CatalogEntryTranslation>;
    spells?: Record<string, CatalogEntryTranslation>;
    classes?: Record<string, CatalogEntryTranslation>;
    subclasses?: Record<string, CatalogEntryTranslation>;
}
