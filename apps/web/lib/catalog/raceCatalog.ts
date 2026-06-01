import {
    getRace as getCatalogRace,
    getSubrace as getCatalogSubrace,
    listRaces as listCatalogRaces,
    type RaceCatalogEntry,
    type SubraceCatalogEntry,
} from "@rpv/content";

/**
 * Catalog read seam for the web app.
 *
 * Currently backed by the bundled `@rpv/content` JSON snapshot. In Group B this
 * file becomes the Supabase-backed repository; the signatures are kept stable
 * (they will become async then) so call sites change minimally.
 */
export function listRaces(): RaceCatalogEntry[] {
    return listCatalogRaces();
}

export function getRace(slug: string): RaceCatalogEntry | undefined {
    return getCatalogRace(slug);
}

export function getSubrace(slug: string): SubraceCatalogEntry | undefined {
    return getCatalogSubrace(slug);
}

export function listRaceOptions(): string[] {
    return listCatalogRaces().map((race) => race.name);
}
