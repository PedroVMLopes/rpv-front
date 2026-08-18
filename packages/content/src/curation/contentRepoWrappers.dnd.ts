import type { Locale } from "@rpv/domain";
import { getContentRepository } from "../repository/getContentRepository";
import type { BackgroundEntry } from "./backgroundGrants.dnd";
import type { ClassEntry } from "./classGrants.dnd";
import type { ItemEntry, ItemSystem } from "../item/item.types";
import type { SubclassEntry } from "./subclassGrants.dnd";

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
