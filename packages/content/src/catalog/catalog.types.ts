import type { StatKey } from "@rpv/domain";
import type { RaceCatalogEntry } from "../race/race.types";
import type { SpellCatalogEntry } from "../spell/spell.types";

export interface Skill {
    slug: string;
    name: string;
    ability: StatKey;
}

export interface Language {
    slug: string;
    name: string;
    type: "standard" | "exotic";
    script?: string;
}

export interface Catalog {
    generatedAt: string;
    source: "open5e";
    races: RaceCatalogEntry[];
    spells: SpellCatalogEntry[];
    skills: Skill[];
    languages: Language[];
}
