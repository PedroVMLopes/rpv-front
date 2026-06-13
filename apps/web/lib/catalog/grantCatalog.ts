import { listLanguages as listCatalogLanguages, getLanguage as getCatalogLanguage } from "@rpv/content";
import type { Language } from "@rpv/content";
import { listBackgrounds } from "@rpv/content";
import { listItems } from "@rpv/content";

export type CatalogSelectOption = {
    value: string;
    label: string;
};

export function listLanguages(): Language[] {
    return listCatalogLanguages();
}

export function getLanguage(slug: string): Language | undefined {
    return getCatalogLanguage(slug);
}

export function listLanguageOptions(): CatalogSelectOption[] {
    return listLanguages().map((language) => ({
        value: language.slug,
        label: language.name,
    }));
}

export function listBackgroundOptions(): CatalogSelectOption[] {
    return listBackgrounds().map((background) => ({
        value: background.slug,
        label: background.name,
    }));
}

export function listStartingItemOptions(): CatalogSelectOption[] {
    return listItems().map((item) => ({
        value: item.slug,
        label: item.name,
    }));
}
