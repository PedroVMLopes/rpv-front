import type { Locale } from "@rpv/domain";
import {
    listRaceOptions,
    listSubraceOptions,
    type CatalogSelectOption,
} from "@/lib/catalog/raceCatalog";
import {
    listBackgroundOptions,
    listStartingItemOptions,
} from "@/lib/catalog/grantCatalog";

type FieldConfig = {
    name: string;
    options?: Array<string | CatalogSelectOption>;
    [key: string]: unknown;
};

export function buildPlayerRaceFields(
    fields: FieldConfig[],
    raceSlug: string | undefined,
    contentLocale: Locale
): FieldConfig[] {
    const raceOptions = listRaceOptions(contentLocale);
    const subraceOptions = listSubraceOptions(raceSlug, contentLocale);
    const backgroundOptions = listBackgroundOptions();
    const startingItemOptions = listStartingItemOptions();

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

        return field;
    });
}
