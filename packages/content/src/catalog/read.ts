import type { RaceCatalogEntry, SubraceCatalogEntry } from "../race/race.types";
import type { Catalog } from "./catalog.types";

export function listRaces(catalog: Catalog): RaceCatalogEntry[] {
    return catalog.races;
}

export function getRace(
    catalog: Catalog,
    slug: string
): RaceCatalogEntry | undefined {
    return catalog.races.find((race) => race.slug === slug);
}

export function getSubrace(
    catalog: Catalog,
    slug: string
): SubraceCatalogEntry | undefined {
    for (const race of catalog.races) {
        const subrace = race.subraces.find((sub) => sub.slug === slug);
        if (subrace) {
            return subrace;
        }
    }
    return undefined;
}
