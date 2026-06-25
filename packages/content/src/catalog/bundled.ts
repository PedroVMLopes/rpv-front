import type { Locale } from "@rpv/domain";
import catalogData from "../../data/catalog.json";
import ptBRTranslations from "../../data/translations/pt-BR.json";
import type { RaceCatalogEntry, SubraceCatalogEntry } from "../race/race.types";
import type { SpellCatalogEntry } from "../spell/spell.types";
import type { Catalog, CatalogTranslations, Language } from "./catalog.types";
import * as read from "./read";

export const catalog = catalogData as unknown as Catalog;

/**
 * Locale overlays bundled alongside the base (English) catalog. The base catalog
 * needs no entry here; only languages we translate into are listed.
 */
const translationsByLocale: Partial<Record<Locale, CatalogTranslations>> = {
    "pt-BR": ptBRTranslations as CatalogTranslations,
};

function overlayFor(locale: Locale): CatalogTranslations | undefined {
    return translationsByLocale[locale];
}

export function listRaces(locale: Locale = catalog.defaultLocale): RaceCatalogEntry[] {
    return read.listRaces(catalog, locale, overlayFor(locale));
}

export function getRace(
    slug: string,
    locale: Locale = catalog.defaultLocale
): RaceCatalogEntry | undefined {
    return read.getRace(catalog, slug, locale, overlayFor(locale));
}

export function getSubrace(
    slug: string,
    locale: Locale = catalog.defaultLocale
): SubraceCatalogEntry | undefined {
    return read.getSubrace(catalog, slug, locale, overlayFor(locale));
}

export function listSpells(locale: Locale = catalog.defaultLocale): SpellCatalogEntry[] {
    return read.listSpells(catalog, locale, overlayFor(locale));
}

export function getSpell(
    slug: string,
    locale: Locale = catalog.defaultLocale
): SpellCatalogEntry | undefined {
    return read.getSpell(catalog, slug, locale, overlayFor(locale));
}

export function listLanguages(): Language[] {
    return read.listLanguages(catalog);
}

export function getLanguage(slug: string): Language | undefined {
    return read.getLanguage(catalog, slug);
}
