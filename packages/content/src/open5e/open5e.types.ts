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
    page?: string;
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
    archetype?: string;
    document__slug?: string;
    document__title?: string;
}

/** Open5e API v2 item document reference (partial). */
export interface Open5eV2DocumentRef {
    name: string;
    key: string;
    type?: string;
    display_name?: string;
}

export interface Open5eV2NamedKey {
    name: string;
    key: string;
}

export interface Open5eV2WeaponPropertyAssignment {
    property: {
        name: string;
        type: string | null;
        desc: string;
    };
    detail: string | null;
}

export interface Open5eV2Weapon {
    name: string;
    key: string;
    damage_type: Open5eV2NamedKey;
    damage_dice: string;
    properties: Open5eV2WeaponPropertyAssignment[];
    is_simple: boolean;
    is_martial: boolean;
    is_improvised: boolean;
    distance_unit?: string | null;
    range?: number | null;
    long_range?: number | null;
}

export interface Open5eV2Armor {
    name: string;
    key: string;
    category: string;
    ac_base: number;
    ac_display: string;
    ac_add_dexmod: boolean;
    ac_cap_dexmod: number | null;
    grants_stealth_disadvantage: boolean;
    strength_score_required: number | null;
}

/** Open5e API v2 `/items/` entry. */
export interface Open5eV2Item {
    key: string;
    name: string;
    desc: string;
    category: Open5eV2NamedKey;
    weapon: Open5eV2Weapon | null;
    armor: Open5eV2Armor | null;
    size?: Open5eV2NamedKey | null;
    weight: string | null;
    weight_unit: string | null;
    cost: string | null;
    document: Open5eV2DocumentRef;
}
