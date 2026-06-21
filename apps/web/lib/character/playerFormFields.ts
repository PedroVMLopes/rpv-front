import type { Locale } from "@rpv/domain";
import {
    listRaceOptions,
    listSubraceOptions,
    type CatalogSelectOption,
} from "@/lib/catalog/raceCatalog";
import {
    listBackgroundOptions,
    listStartingItemOptions,
    listClassOptions,
    listSubclassOptions,
} from "@/lib/catalog/grantCatalog";

type FieldConfig = {
    name: string;
    options?: Array<string | CatalogSelectOption>;
    [key: string]: unknown;
};

type PlayerGrantSourceFieldOptions = {
    raceSlug?: string;
    classSlug?: string;
    contentLocale: Locale;
};

export function buildPlayerGrantSourceFields(
    fields: FieldConfig[],
    { raceSlug, classSlug, contentLocale }: PlayerGrantSourceFieldOptions
): FieldConfig[] {
    const raceOptions = listRaceOptions(contentLocale);
    const subraceOptions = listSubraceOptions(raceSlug, contentLocale);
    const backgroundOptions = listBackgroundOptions();
    const startingItemOptions = listStartingItemOptions();
    const classOptions = listClassOptions(contentLocale);
    const subclassOptions = listSubclassOptions(classSlug, contentLocale);

    return fields.map((field) => {
        if (field.name === "race" && raceOptions.length > 0) {
            return { ...field, options: raceOptions };
        }

        if (field.name === "subrace") {
            return { ...field, options: subraceOptions };
        }

        if (field.name === "background" && backgroundOptions.length > 0) {
            return { ...field, options: backgroundOptions };
        }

        if (field.name === "startingItem" && startingItemOptions.length > 0) {
            return { ...field, options: startingItemOptions };
        }

        if (field.name === "characterClass" && classOptions.length > 0) {
            return { ...field, options: classOptions };
        }

        if (field.name === "subclass") {
            return { ...field, options: subclassOptions };
        }

        return field;
    });
}

/** @deprecated Use buildPlayerGrantSourceFields */
export function buildPlayerRaceFields(
    fields: FieldConfig[],
    raceSlug: string | undefined,
    contentLocale: Locale
): FieldConfig[] {
    return buildPlayerGrantSourceFields(fields, {
        raceSlug,
        contentLocale,
    });
}
