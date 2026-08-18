import type { Locale } from "@rpv/domain";
import { getClassSubclassLevel } from "@rpv/content";
import { contentRepo } from "@/lib/content/contentRepository";
import type { SystemKey } from "@/presets";
import type {
    CatalogSelectionContext,
    CatalogSelectionEntry,
    CatalogSelectionKind,
    CatalogSelectionSource,
} from "../catalogSelection.types";
import { truncateSummary } from "../textUtils";
import {
    extractBackgroundGrants,
    extractClassGrants,
    extractRaceGrants,
    extractSubraceGrants,
    extractSubclassGrants,
} from "../extractCatalogGrants";

function listDndRaces(locale: Locale): CatalogSelectionEntry[] {
    return contentRepo("dnd")
        .listRaces(locale)
        .map((race) => ({
            slug: race.slug,
            title: race.name,
            summary: truncateSummary(race.description),
            detailDescription: race.description,
            grants: extractRaceGrants(race),
            badges: [
                { label: race.size, variant: "muted" },
                { label: `${race.speedWalk} ft`, variant: "muted" },
            ],
            metadata: {
                speedWalk: race.speedWalk,
                visionDesc: race.visionDesc,
                size: race.size,
                asiDesc: race.asiDesc,
                ageDesc: race.ageDesc,
                alignmentDesc: race.alignmentDesc,
            },
        }));
}

function listDndSubraces(
    locale: Locale,
    context: CatalogSelectionContext
): CatalogSelectionEntry[] {
    if (!context.raceSlug) {
        return [];
    }

    const race = contentRepo("dnd").getRace(context.raceSlug, locale);

    if (!race) {
        return [];
    }

    return race.subraces.map((subrace) => ({
        slug: subrace.slug,
        title: subrace.name,
        summary: truncateSummary(subrace.description),
        detailDescription: subrace.description,
        grants: extractSubraceGrants(subrace),
        metadata: {
            asiDesc: subrace.asiDesc,
        },
    }));
}

function listDndClasses(
    locale: Locale,
    context: CatalogSelectionContext
): CatalogSelectionEntry[] {
    const characterLevel = context.characterLevel ?? 1;

    return contentRepo("dnd")
        .listClasses(locale)
        .map((classEntry) => {
            const subclassLevel = getClassSubclassLevel(classEntry.slug);

            return {
                slug: classEntry.slug,
                title: classEntry.name,
                summary: truncateSummary(classEntry.description),
                detailDescription: classEntry.description,
                grants: extractClassGrants(classEntry, characterLevel),
                badges: [
                    {
                        label: `d${classEntry.hitDie}`,
                        variant: "muted",
                    },
                    ...(subclassLevel
                        ? [
                              {
                                  label: `Subclass L${subclassLevel}`,
                                  variant: "muted" as const,
                              },
                          ]
                        : []),
                ],
                metadata: {
                    hitDie: classEntry.hitDie,
                    subclassLevel,
                },
            };
        });
}

function listDndSubclasses(
    locale: Locale,
    context: CatalogSelectionContext
): CatalogSelectionEntry[] {
    if (!context.classSlug) {
        return [];
    }

    return contentRepo("dnd")
        .listSubclassesForClass(context.classSlug, locale)
        .map((subclass) => ({
            slug: subclass.slug,
            title: subclass.name,
            summary: truncateSummary(subclass.description ?? subclass.name),
            detailDescription: subclass.description ?? subclass.name,
            grants: extractSubclassGrants(
                subclass,
                context.classSlug!,
                context.characterLevel ?? 1
            ),
        }));
}

function listDndBackgrounds(locale: Locale): CatalogSelectionEntry[] {
    return contentRepo("dnd")
        .listBackgrounds(locale)
        .map((background) => ({
            slug: background.slug,
            title: background.name,
            summary: truncateSummary(background.description),
            detailDescription: background.description,
            grants: extractBackgroundGrants(background),
        }));
}

const dndSources: Record<CatalogSelectionKind, CatalogSelectionSource> = {
    race: { list: (locale) => listDndRaces(locale) },
    subrace: { list: listDndSubraces },
    class: { list: listDndClasses },
    subclass: { list: listDndSubclasses },
    background: { list: (locale) => listDndBackgrounds(locale) },
};

export function getCatalogSelectionSource(
    system: SystemKey,
    kind: CatalogSelectionKind
): CatalogSelectionSource {
    if (system === "dnd") {
        return dndSources[kind];
    }

    return { list: () => [] };
}
