import type { Locale } from "@rpv/domain";
import { localizeCurationEntry } from "./curationLocale";
import { dndBackgrounds, type BackgroundEntry } from "./backgroundGrants.dnd";
import { dndClasses, type ClassEntry } from "./classGrants.dnd";
import { dndItems, type ItemEntry } from "./itemGrants.dnd";
import { dndSubclasses, type SubclassEntry } from "./subclassGrants.dnd";

function localizeClass(entry: ClassEntry, locale?: Locale): ClassEntry {
    return localizeCurationEntry(entry, "classes", locale);
}

function localizeBackground(entry: BackgroundEntry): BackgroundEntry {
    return entry;
}

function localizeItem(entry: ItemEntry, locale?: Locale): ItemEntry {
    return localizeCurationEntry(entry, "items", locale);
}

function localizeSubclass(entry: SubclassEntry, locale?: Locale): SubclassEntry {
    return localizeCurationEntry(entry, "subclasses", locale);
}

function dndItemsOnly(): ItemEntry[] {
    return dndItems.filter((entry) => entry.system === "dnd");
}

export function readClass(slug: string, locale?: Locale): ClassEntry | undefined {
    const entry = dndClasses.find((item) => item.slug === slug);
    if (!entry) {
        return undefined;
    }
    return localizeClass(entry, locale);
}

export function readListClasses(locale?: Locale): ClassEntry[] {
    return dndClasses.map((entry) => localizeClass(entry, locale));
}

export function readBackground(slug: string): BackgroundEntry | undefined {
    const entry = dndBackgrounds.find((item) => item.slug === slug);
    if (!entry) {
        return undefined;
    }
    return localizeBackground(entry);
}

export function readListBackgrounds(): BackgroundEntry[] {
    return dndBackgrounds.map((entry) => localizeBackground(entry));
}

export function readItem(slug: string, locale?: Locale): ItemEntry | undefined {
    const entry = dndItemsOnly().find((item) => item.slug === slug);
    if (!entry) {
        return undefined;
    }
    return localizeItem(entry, locale);
}

export function readListItems(locale?: Locale): ItemEntry[] {
    return dndItemsOnly().map((entry) => localizeItem(entry, locale));
}

export function readSubclass(slug: string, locale?: Locale): SubclassEntry | undefined {
    const entry = dndSubclasses.find((subclass) => subclass.slug === slug);
    if (!entry) {
        return undefined;
    }
    return localizeSubclass(entry, locale);
}

export function readListSubclassesForClass(
    classSlug: string,
    locale?: Locale
): SubclassEntry[] {
    return dndSubclasses
        .filter((entry) => entry.classSlug === classSlug)
        .map((entry) => localizeSubclass(entry, locale));
}
