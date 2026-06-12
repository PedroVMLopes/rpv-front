export interface Open5ePaginated<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface Open5eAsiEntry {
    attributes: string[];
    value: number;
}

export interface Open5eSubrace {
    name: string;
    slug: string;
    desc: string;
    asi: Open5eAsiEntry[];
    asi_desc: string;
    traits: string;
    document__slug?: string;
    document__title?: string;
}

export interface Open5eRace {
    name: string;
    slug: string;
    desc: string;
    asi_desc: string;
    asi: Open5eAsiEntry[];
    age: string;
    alignment: string;
    size: string;
    size_raw: string;
    speed: { walk?: number } & Record<string, number | undefined>;
    speed_desc: string;
    languages: string;
    vision: string;
    traits: string;
    subraces: Open5eSubrace[];
    document__slug?: string;
    document__title?: string;
}

export interface Open5eSpell {
    slug: string;
    name: string;
    desc: string;
    higher_level: string;
    range: string;
    components: string;
    material: string;
    ritual: string;
    can_be_cast_as_ritual: boolean;
    duration: string;
    concentration: string;
    requires_concentration: boolean;
    casting_time: string;
    level: string;
    level_int: number;
    school: string;
    dnd_class: string;
    spell_lists: string[];
    document__slug?: string;
    document__title?: string;
}
