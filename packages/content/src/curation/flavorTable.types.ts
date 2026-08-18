export interface FlavorTableOption {
    slug: string;
    label: string;
}

/**
 * Suggested narrative picks attached to content (e.g. a background).
 * Not a Grant: options do not produce CharacterGrants or grantPicks.
 */
export interface FlavorTable {
    slug: string;
    /** Optional form / systemData field this table fills. */
    bindTo?: string;
    pickCount: number;
    /** UI roll hint such as "d8" or "d20". Not resolved by the engine. */
    roll?: string;
    allowCustom: boolean;
    options: FlavorTableOption[];
}
