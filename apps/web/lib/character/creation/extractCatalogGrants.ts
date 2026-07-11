import type {
    BackgroundEntry,
    ClassEntry,
    RaceCatalogEntry,
    SubclassEntry,
    SubraceCatalogEntry,
} from "@rpv/content";
import {
    getClassGrants,
    getClassSubclassLevel,
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
    classSlug: string,
    characterLevel = 1
): Grant[] {
    const subclassLevel = getClassSubclassLevel(classSlug) ?? characterLevel;
    return getSubclassGrants(subclass.slug, Math.max(subclassLevel, 1));
}

export function extractBackgroundGrants(background: BackgroundEntry): Grant[] {
    return background.grants;
}
