import type { Locale } from "@rpv/domain";
import {
    listRaceOptions,
    listSubraceOptions,
    type CatalogSelectOption,
} from "@/lib/catalog/raceCatalog";

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

    return fields.map((field) => {
        if (field.name === "race" && raceOptions.length > 0) {
            return { ...field, options: raceOptions };
        }

        if (field.name === "subrace") {
            return { ...field, options: subraceOptions };
        }

        return field;
    });
}
