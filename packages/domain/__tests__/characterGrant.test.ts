import {
    Character,
    CharacterGrant,
    removeGrantsBySource,
    getLanguages,
    getAbilities,
    getProficiencies,
    getResources,
    getSavingThrows,
    getSpells,
    aggregateResourceGrants,
} from "../src";

const baseStats = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    armorClass: 10,
    hitPoints: 10,
};

function createGrant(
    overrides: Partial<CharacterGrant> & Pick<CharacterGrant, "kind" | "ref">
): CharacterGrant {
    return {
        id: "grant-1",
        source: { type: "race", id: "elf" },
        ...overrides,
    };
}

describe("removeGrantsBySource", () => {
    const grants: CharacterGrant[] = [
        createGrant({ id: "lang-1", kind: "language", ref: "common", source: { type: "race", id: "dwarf" } }),
        createGrant({ id: "lang-2", kind: "language", ref: "dwarvish", source: { type: "race", id: "dwarf" } }),
        createGrant({ id: "spell-1", kind: "spell", ref: "fire-bolt", source: { type: "item", id: "scroll-fire-bolt" } }),
    ];

    it("removes all grants of a source type when id is omitted", () => {
        const result = removeGrantsBySource(grants, { type: "race" });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("spell-1");
    });

    it("removes grants matching both type and id", () => {
        const result = removeGrantsBySource(grants, { type: "race", id: "dwarf" });
        expect(result).toHaveLength(1);
        expect(result[0].source.type).toBe("item");
    });

    it("preserves grants when source does not match", () => {
        const result = removeGrantsBySource(grants, { type: "background", id: "sage" });
        expect(result).toHaveLength(3);
    });
});

describe("grant selectors", () => {
    const grants: CharacterGrant[] = [
        createGrant({ id: "lang-1", kind: "language", ref: "common" }),
        createGrant({ id: "ability-1", kind: "ability", ref: "fey-ancestry" }),
        createGrant({ id: "spell-1", kind: "spell", ref: "fire-bolt" }),
    ];

    it("getLanguages returns only language grants", () => {
        expect(getLanguages(grants)).toHaveLength(1);
        expect(getLanguages(grants)[0].ref).toBe("common");
    });

    it("getAbilities returns only ability grants", () => {
        expect(getAbilities(grants)).toHaveLength(1);
        expect(getAbilities(grants)[0].ref).toBe("fey-ancestry");
    });

    it("getSpells returns only spell grants", () => {
        expect(getSpells(grants)).toHaveLength(1);
        expect(getSpells(grants)[0].ref).toBe("fire-bolt");
    });
});

describe("proficiency and saving throw selectors", () => {
    const grants: CharacterGrant[] = [
        createGrant({ id: "prof-1", kind: "proficiency", ref: "athletics" }),
        createGrant({
            id: "save-1",
            kind: "saving_throw",
            ref: "strength",
        }),
        createGrant({ id: "spell-1", kind: "spell", ref: "fire-bolt" }),
    ];

    it("getProficiencies returns only proficiency grants", () => {
        expect(getProficiencies(grants)).toEqual([
            expect.objectContaining({ id: "prof-1", ref: "athletics" }),
        ]);
    });

    it("getSavingThrows returns only saving_throw grants", () => {
        expect(getSavingThrows(grants)).toEqual([
            expect.objectContaining({ id: "save-1", ref: "strength" }),
        ]);
    });
});

describe("resource grants", () => {
    it("getResources returns only resource grants", () => {
        const grants: CharacterGrant[] = [
            createGrant({ id: "slot-1", kind: "resource", ref: "spell-slots-1", amount: 2 }),
            createGrant({ id: "lang-1", kind: "language", ref: "common" }),
        ];

        expect(getResources(grants)).toHaveLength(1);
        expect(getResources(grants)[0].ref).toBe("spell-slots-1");
    });

    it("aggregateResourceGrants sums amounts by ref", () => {
        const grants: CharacterGrant[] = [
            createGrant({ id: "slot-1a", kind: "resource", ref: "spell-slots-1", amount: 2 }),
            createGrant({ id: "slot-1b", kind: "resource", ref: "spell-slots-1", amount: 1 }),
            createGrant({ id: "slot-2", kind: "resource", ref: "spell-slots-2", amount: 1 }),
        ];

        expect(aggregateResourceGrants(grants)).toEqual({
            "spell-slots-1": 3,
            "spell-slots-2": 1,
        });
    });

    it("aggregateResourceGrants ignores resource grants without amount", () => {
        const grants: CharacterGrant[] = [
            createGrant({ id: "slot-1", kind: "resource", ref: "spell-slots-1", amount: 2 }),
            createGrant({ id: "slot-2", kind: "resource", ref: "spell-slots-2" }),
        ];

        expect(aggregateResourceGrants(grants)).toEqual({
            "spell-slots-1": 2,
        });
    });
});

describe("Character grants", () => {
    const defaultProps = {
        id: "char-1",
        type: "player" as const,
        name: "Test Hero",
        baseStats,
        modifiers: [],
        grants: [
            createGrant({ id: "lang-1", kind: "language", ref: "elvish" }),
            createGrant({ id: "spell-1", kind: "spell", ref: "fire-bolt" }),
            createGrant({
                id: "prof-1",
                kind: "proficiency",
                ref: "perception",
            }),
        ],
    };

    it("getGrants returns a copy of grants", () => {
        const character = Character.create(defaultProps);
        const grants = character.getGrants();
        grants.push(createGrant({ id: "x", kind: "language", ref: "common" }));
        expect(character.getGrants()).toHaveLength(3);
    });

    it("getLanguages delegates to selector", () => {
        const character = Character.create(defaultProps);
        expect(character.getLanguages()).toHaveLength(1);
        expect(character.getLanguages()[0].ref).toBe("elvish");
    });

    it("getSpells and getProficiencies delegate to selectors", () => {
        const character = Character.create(defaultProps);
        expect(character.getSpells().map((grant) => grant.ref)).toEqual([
            "fire-bolt",
        ]);
        expect(character.getProficiencies().map((grant) => grant.ref)).toEqual([
            "perception",
        ]);
    });

    it("addGrant returns a new instance with the grant", () => {
        const character = Character.create(defaultProps);
        const newGrant = createGrant({ id: "lang-2", kind: "language", ref: "common" });
        const updated = character.addGrant(newGrant);

        expect(character.getGrants()).toHaveLength(3);
        expect(updated.getGrants()).toHaveLength(4);
    });

    it("removeGrant returns a new instance without the grant", () => {
        const character = Character.create(defaultProps);
        const updated = character.removeGrant("lang-1");

        expect(character.getGrants()).toHaveLength(3);
        expect(updated.getGrants()).toHaveLength(2);
        expect(updated.getLanguages()).toEqual([]);
    });

    it("toProps includes grants", () => {
        const character = Character.create(defaultProps);
        expect(character.toProps().grants).toHaveLength(3);
    });
});
