import type { Locale } from "@rpv/domain";
import type { RaceCatalogEntry, SubraceCatalogEntry } from "@rpv/content";
import { contentRepo } from "@/lib/content/contentRepository";

export type CatalogSelectOption = {
    value: string;
    label: string;
};

/**
 * Catalog read seam for the web app.
 *
 * Delegates to `contentRepo()` (backed by StaticContentRepository today).
 * A future SupabaseContentRepository will implement the same ContentRepository
 * interface; signatures may become async then.
 */
export function listRaces(locale?: Locale): RaceCatalogEntry[] {
    return contentRepo().listRaces(locale);
}

export function getRace(slug: string, locale?: Locale): RaceCatalogEntry | undefined {
    return contentRepo().getRace(slug, locale);
}

export function getSubrace(slug: string, locale?: Locale): SubraceCatalogEntry | undefined {
    return contentRepo().getSubrace(slug, locale);
}

export function listRaceOptions(locale?: Locale): CatalogSelectOption[] {
    return listRaces(locale).map((race) => ({
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

    const race = getRace(raceSlug, locale);
    if (!race) {
        return [];
    }

    return race.subraces.map((subrace) => ({
        value: subrace.slug,
        label: subrace.name,
    }));
}
