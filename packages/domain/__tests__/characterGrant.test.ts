import {
    Character,
    CharacterGrant,
    removeGrantsBySource,
    getLanguages,
    getAbilities,
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
        ],
    };

    it("getGrants returns a copy of grants", () => {
        const character = Character.create(defaultProps);
        const grants = character.getGrants();
        grants.push(createGrant({ id: "x", kind: "language", ref: "common" }));
        expect(character.getGrants()).toHaveLength(1);
    });

    it("getLanguages delegates to selector", () => {
        const character = Character.create(defaultProps);
        expect(character.getLanguages()).toHaveLength(1);
        expect(character.getLanguages()[0].ref).toBe("elvish");
    });

    it("addGrant returns a new instance with the grant", () => {
        const character = Character.create(defaultProps);
        const newGrant = createGrant({ id: "lang-2", kind: "language", ref: "common" });
        const updated = character.addGrant(newGrant);

        expect(character.getGrants()).toHaveLength(1);
        expect(updated.getGrants()).toHaveLength(2);
    });

    it("removeGrant returns a new instance without the grant", () => {
        const character = Character.create(defaultProps);
        const updated = character.removeGrant("lang-1");

        expect(character.getGrants()).toHaveLength(1);
        expect(updated.getGrants()).toHaveLength(0);
    });

    it("toProps includes grants", () => {
        const character = Character.create(defaultProps);
        expect(character.toProps().grants).toHaveLength(1);
    });
});
