import catalogData from "../../data/catalog.json";
import type { RaceCatalogEntry, SubraceCatalogEntry } from "../race/race.types";
import type { Catalog } from "./catalog.types";
import * as read from "./read";

export const catalog = catalogData as unknown as Catalog;

export function listRaces(): RaceCatalogEntry[] {
    return read.listRaces(catalog);
}

export function getRace(slug: string): RaceCatalogEntry | undefined {
    return read.getRace(catalog, slug);
}

export function getSubrace(slug: string): SubraceCatalogEntry | undefined {
    return read.getSubrace(catalog, slug);
}
