import {
    getRace as getCatalogRace,
    getSubrace as getCatalogSubrace,
    listRaces as listCatalogRaces,
    type RaceCatalogEntry,
    type SubraceCatalogEntry,
} from "@rpv/content";
import type { Locale } from "@rpv/domain";

export type CatalogSelectOption = {
    value: string;
    label: string;
};

/**
 * Catalog read seam for the web app.
 *
 * Currently backed by the bundled `@rpv/content` JSON snapshot. In Group B this
 * file becomes the Supabase-backed repository; the signatures are kept stable
 * (they will become async then) so call sites change minimally. The optional
 * `locale` selects the content language, independently of the UI language.
 */
export function listRaces(locale?: Locale): RaceCatalogEntry[] {
    return listCatalogRaces(locale);
}

export function getRace(slug: string, locale?: Locale): RaceCatalogEntry | undefined {
    return getCatalogRace(slug, locale);
}

export function getSubrace(slug: string, locale?: Locale): SubraceCatalogEntry | undefined {
    return getCatalogSubrace(slug, locale);
}

export function listRaceOptions(locale?: Locale): CatalogSelectOption[] {
    return listCatalogRaces(locale).map((race) => ({
        value: race.slug,
        label: race.name,
    }));
}

export function listSubraceOptions(
    raceSlug: string | undefined,
    locale?: Locale
): CatalogSelectOption[] {
    if (!raceSlug) {
        return [];
    }

    const race = getCatalogRace(raceSlug, locale);
    if (!race) {
        return [];
    }

    return race.subraces.map((subrace) => ({
        value: subrace.slug,
        label: subrace.name,
    }));
}
