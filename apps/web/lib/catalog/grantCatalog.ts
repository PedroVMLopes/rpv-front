import type { Locale } from "@rpv/domain";
import type { Language } from "@rpv/content";
import { contentRepo } from "@/lib/content/contentRepository";

export type CatalogSelectOption = {
    value: string;
    label: string;
};

export function listLanguages(): Language[] {
    return contentRepo().listLanguages();
}

export function getLanguage(slug: string): Language | undefined {
    return contentRepo().getLanguage(slug);
}

export function listLanguageOptions(): CatalogSelectOption[] {
    return listLanguages().map((language) => ({
        value: language.slug,
        label: language.name,
    }));
}

export function listBackgroundOptions(): CatalogSelectOption[] {
    return contentRepo().listBackgrounds().map((background) => ({
        value: background.slug,
        label: background.name,
    }));
}

export function listStartingItemOptions(): CatalogSelectOption[] {
    return contentRepo().listItems().map((item) => ({
        value: item.slug,
        label: item.name,
    }));
}

export function listClassOptions(locale?: Locale): CatalogSelectOption[] {
    return contentRepo().listClasses(locale).map((characterClass) => ({
        value: characterClass.slug,
        label: characterClass.name,
    }));
}

export function listSubclassOptions(
    classSlug: string | undefined,
    locale?: Locale
): CatalogSelectOption[] {
    if (!classSlug) {
        return [];
    }

    return contentRepo().listSubclassesForClass(classSlug, locale).map((subclass) => ({
        value: subclass.slug,
        label: subclass.name,
    }));
}

export function getClassHitDie(slug: string): number | undefined {
    return contentRepo().getClass(slug)?.hitDie;
}
