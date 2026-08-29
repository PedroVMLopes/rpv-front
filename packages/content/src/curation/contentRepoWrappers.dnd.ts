import type { Locale } from "@rpv/domain";
import { getContentRepository } from "../repository/getContentRepository";
import type { BackgroundEntry } from "./backgroundGrants.dnd";
import type { ClassEntry } from "./classGrants.dnd";
import type { ItemEntry, ItemSystem } from "../item/item.types";
import type { SubclassEntry } from "./subclassGrants.dnd";
import type { Language } from "../catalog/catalog.types";
import type { RaceCatalogEntry, SubraceCatalogEntry } from "../race/race.types";
import type { SpellCatalogEntry } from "../spell/spell.types";

export function getClass(slug: string, locale?: Locale): ClassEntry | undefined {
    return getContentRepository("dnd").getClass(slug, locale);
}

export function listClasses(locale?: Locale): ClassEntry[] {
    return getContentRepository("dnd").listClasses(locale);
}

export function getBackground(
    slug: string,
    locale?: Locale
): BackgroundEntry | undefined {
    return getContentRepository("dnd").getBackground(slug, locale);
}

export function listBackgrounds(locale?: Locale): BackgroundEntry[] {
    return getContentRepository("dnd").listBackgrounds(locale);
}

export function getItem(
    slug: string,
    system: ItemSystem = "dnd",
    locale?: Locale
): ItemEntry | undefined {
    if (system !== "dnd") {
        return undefined;
    }
    return getContentRepository("dnd").getItem(slug, locale);
}

export function listItems(system: ItemSystem = "dnd", locale?: Locale): ItemEntry[] {
    if (system !== "dnd") {
        return [];
    }
    return getContentRepository("dnd").listItems(locale);
}

export function getSubclass(slug: string, locale?: Locale): SubclassEntry | undefined {
    return getContentRepository("dnd").getSubclass(slug, locale);
}

export function listSubclassesForClass(
    classSlug: string,
    locale?: Locale
): SubclassEntry[] {
    return getContentRepository("dnd").listSubclassesForClass(classSlug, locale);
}

export function listRaces(locale?: Locale): RaceCatalogEntry[] {
    return getContentRepository("dnd").listRaces(locale);
}

export function getRace(
    slug: string,
    locale?: Locale
): RaceCatalogEntry | undefined {
    return getContentRepository("dnd").getRace(slug, locale);
}

export function getSubrace(
    slug: string,
    locale?: Locale
): SubraceCatalogEntry | undefined {
    return getContentRepository("dnd").getSubrace(slug, locale);
}

export function listSpells(locale?: Locale): SpellCatalogEntry[] {
    return getContentRepository("dnd").listSpells(locale);
}

export function getSpell(
    slug: string,
    locale?: Locale
): SpellCatalogEntry | undefined {
    return getContentRepository("dnd").getSpell(slug, locale);
}

export function listLanguages(): Language[] {
    return getContentRepository("dnd").listLanguages();
}

export function getLanguage(slug: string): Language | undefined {
    return getContentRepository("dnd").getLanguage(slug);
}

export function listFeats(locale?: Locale) {
    return getContentRepository("dnd").listFeats(locale);
}

export function getFeat(slug: string, locale?: Locale) {
    return getContentRepository("dnd").getFeat(slug, locale);
}

