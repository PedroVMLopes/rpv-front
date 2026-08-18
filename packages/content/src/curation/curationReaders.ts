import type { Locale } from "@rpv/domain";
import { localizeCurationEntry } from "./curationLocale";
import { dndBackgrounds, type BackgroundEntry } from "./backgroundGrants.dnd";
import { dndClasses, type ClassEntry } from "./classGrants.dnd";
import type { ItemEntry } from "../item/item.types";
import { dndSubclasses, type SubclassEntry } from "./subclassGrants.dnd";
import * as bundled from "../catalog/bundled";

function localizeClass(entry: ClassEntry, locale?: Locale): ClassEntry {
    return localizeCurationEntry(entry, "classes", locale);
}

function localizeBackground(
    entry: BackgroundEntry,
    locale?: Locale
): BackgroundEntry {
    return localizeCurationEntry(entry, "backgrounds", locale);
}

function localizeSubclass(entry: SubclassEntry, locale?: Locale): SubclassEntry {
    return localizeCurationEntry(entry, "subclasses", locale);
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

export function readBackground(
    slug: string,
    locale?: Locale
): BackgroundEntry | undefined {
    const entry = dndBackgrounds.find((item) => item.slug === slug);
    if (!entry) {
        return undefined;
    }
    return localizeBackground(entry, locale);
}

export function readListBackgrounds(locale?: Locale): BackgroundEntry[] {
    return dndBackgrounds.map((entry) => localizeBackground(entry, locale));
}

export function readItem(slug: string, locale?: Locale): ItemEntry | undefined {
    return bundled.getItem(slug, locale ?? "en");
}

export function readListItems(locale?: Locale): ItemEntry[] {
    return bundled.listItems(locale ?? "en");
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
