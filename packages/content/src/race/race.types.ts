import type { Locale } from "@rpv/domain";
import type { Grant } from "../grant/grant.types";

export type TraitCategory =
    | "ability_score"
    | "proficiency"
    | "spellcasting"
    | "language"
    | "sense"
    | "resistance"
    | "movement"
    | "other";

export interface CatalogTrait {
    slug: string;
    name: string;
    description: string;
    category: TraitCategory;
    grants: Grant[];
}

export interface SubraceCatalogEntry {
    slug: string;
    raceSlug: string;
    /** Language this entry's text is authored in. */
    language: Locale;
    name: string;
    description: string;
    asiDesc: string;
    traits: CatalogTrait[];
}

export interface RaceCatalogEntry {
    slug: string;
    /** Language this entry's text is authored in. */
    language: Locale;
    name: string;
    system: "dnd";
    sourceDocument: string;
    description: string;
    size: string;
    speedWalk: number;
    languagesDesc: string;
    visionDesc: string;
    asiDesc: string;
    traits: CatalogTrait[];
    subraces: SubraceCatalogEntry[];
}
