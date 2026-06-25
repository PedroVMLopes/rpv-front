import type { Locale } from "@rpv/domain";
import { getClassSubclassLevel } from "@rpv/content";
import type { CharacterCreationStepId } from "@/lib/character/characterCreationSteps";
import {
    filterFieldsForStep,
} from "@/lib/character/characterCreationSteps";
import {
    listRaceOptions,
    listSubraceOptions,
    type CatalogSelectOption,
} from "@/lib/catalog/raceCatalog";
import {
    listBackgroundOptions,
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
    level?: number;
    contentLocale: Locale;
};

export function buildPlayerGrantSourceFields(
    fields: FieldConfig[],
    { raceSlug, classSlug, level, contentLocale }: PlayerGrantSourceFieldOptions
): FieldConfig[] {
    const raceOptions = listRaceOptions(contentLocale);
    const subraceOptions = listSubraceOptions(raceSlug, contentLocale);
    const backgroundOptions = listBackgroundOptions();
    const classOptions = listClassOptions(contentLocale);
    const subclassOptions = listSubclassOptions(classSlug, contentLocale);
    const subclassLevel = classSlug ? getClassSubclassLevel(classSlug) : undefined;
    const resolvedLevel =
        typeof level === "number" && !Number.isNaN(level) ? level : 1;
    const subclassLocked =
        subclassLevel !== undefined && resolvedLevel < subclassLevel;

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

        if (field.name === "characterClass" && classOptions.length > 0) {
            return { ...field, options: classOptions };
        }

        if (field.name === "subclass") {
            return {
                ...field,
                options: subclassOptions,
                disabled: subclassLocked,
                helperKey: subclassLocked ? "fields.subclassLocked" : undefined,
                helperValues: subclassLocked
                    ? { level: subclassLevel ?? 3 }
                    : undefined,
            };
        }

        return field;
    });
}

export function getVisiblePlayerFields(
    fields: FieldConfig[],
    stepId: CharacterCreationStepId,
    {
        raceSlug,
        classSlug,
        level,
        contentLocale,
    }: Pick<
        PlayerGrantSourceFieldOptions,
        "raceSlug" | "classSlug" | "level" | "contentLocale"
    >
): FieldConfig[] {
    let visible = filterFieldsForStep(fields, stepId);

    if (stepId === "race") {
        const subraceOptions = listSubraceOptions(raceSlug, contentLocale);
        if (!raceSlug || subraceOptions.length === 0) {
            visible = visible.filter((field) => field.name !== "subrace");
        }
    }

    if (stepId === "class") {
        const hasClass =
            typeof classSlug === "string" && classSlug.trim() !== "";
        const subclassLevel = hasClass
            ? getClassSubclassLevel(classSlug)
            : undefined;
        const resolvedLevel =
            typeof level === "number" && !Number.isNaN(level) ? level : 1;

        if (
            !hasClass ||
            (subclassLevel !== undefined && resolvedLevel < subclassLevel)
        ) {
            visible = visible.filter((field) => field.name !== "subclass");
        }
    }

    return visible;
}

export function filterPlayerFormFields(
    fields: FieldConfig[],
    excludedNames: string[] = ["hp", "maxHp", "ac"]
): FieldConfig[] {
    return fields.filter(
        (field) =>
            field.type !== "attributeGroup" &&
            !excludedNames.includes(field.name)
    );
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
