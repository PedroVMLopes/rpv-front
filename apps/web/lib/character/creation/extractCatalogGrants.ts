import type {
    BackgroundEntry,
    ClassEntry,
    RaceCatalogEntry,
    SubclassEntry,
    SubraceCatalogEntry,
} from "@rpv/content";
import {
    getClassGrants,
    getSubclassGrants,
    type Grant,
} from "@rpv/content";

export function extractRaceGrants(race: RaceCatalogEntry): Grant[] {
    return race.traits.flatMap((trait) => trait.grants);
}

export function extractSubraceGrants(subrace: SubraceCatalogEntry): Grant[] {
    return subrace.traits.flatMap((trait) => trait.grants);
}

export function extractClassGrants(
    classEntry: ClassEntry,
    characterLevel = 1
): Grant[] {
    return getClassGrants(classEntry.slug, characterLevel);
}

export function extractSubclassGrants(
    subclass: SubclassEntry,
    _classSlug: string,
    characterLevel = 1
): Grant[] {
    return getSubclassGrants(subclass.slug, characterLevel);
}

export function extractBackgroundGrants(background: BackgroundEntry): Grant[] {
    return background.grants;
}
