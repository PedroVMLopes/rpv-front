import type { CharacterGrant } from "@rpv/domain";
import { dndSkills } from "@rpv/content";
import {
    humanizeProficiencyRef,
    partitionProficiencies,
    proficiencyCategoryFromGrantId,
} from "../lib/character/proficiencyDisplay";

describe("humanizeProficiencyRef", () => {
    it("title-cases kebab-case refs", () => {
        expect(humanizeProficiencyRef("martial-weapons")).toBe("Martial Weapons");
        expect(humanizeProficiencyRef("light-armor")).toBe("Light Armor");
        expect(humanizeProficiencyRef("smiths-tools")).toBe("Smiths Tools");
    });
});

describe("proficiencyCategoryFromGrantId", () => {
    it("detects grantType embedded in fixed grant ids", () => {
        expect(
            proficiencyCategoryFromGrantId(
                "class-fighter-weapon_proficiency-martial-weapons-0"
            )
        ).toBe("weapon");
        expect(
            proficiencyCategoryFromGrantId(
                "class-fighter-armor_proficiency-light-armor-0"
            )
        ).toBe("armor");
        expect(
            proficiencyCategoryFromGrantId(
                "race-dwarf-tool_proficiency-smiths-tools-0"
            )
        ).toBe("tool");
    });

    it("detects grantType in choice keys", () => {
        expect(
            proficiencyCategoryFromGrantId(
                "class-fighter-class:fighter:base:weapon_proficiency:0:0-longsword"
            )
        ).toBe("weapon");
    });

    it("falls back to other when grantType is absent", () => {
        expect(proficiencyCategoryFromGrantId("class-fighter-mystery-ref")).toBe(
            "other"
        );
    });
});

describe("partitionProficiencies", () => {
    const grants: CharacterGrant[] = [
        {
            id: "class-fighter-skill_proficiency-athletics-0",
            kind: "proficiency",
            ref: "athletics",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-weapon_proficiency-martial-weapons-0",
            kind: "proficiency",
            ref: "martial-weapons",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-armor_proficiency-light-armor-0",
            kind: "proficiency",
            ref: "light-armor",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "race-dwarf-tool_proficiency-smiths-tools-0",
            kind: "proficiency",
            ref: "smiths-tools",
            source: { type: "race", id: "dwarf" },
            name: "Smith's Tools",
        },
        {
            id: "class-fighter-unknown-proficiency-foo",
            kind: "proficiency",
            ref: "mystery-prof",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "race-elf-language-elvish",
            kind: "language",
            ref: "elvish",
            source: { type: "race", id: "elf" },
            name: "Elvish",
        },
        {
            id: "class-fighter-saving_throw-strength",
            kind: "saving_throw",
            ref: "strength",
            source: { type: "class", id: "fighter" },
        },
    ];

    it("buckets equipment proficiencies and languages, excluding skills", () => {
        const partitioned = partitionProficiencies(grants, dndSkills);

        expect(partitioned.weapons.map((p) => p.ref)).toEqual([
            "martial-weapons",
        ]);
        expect(partitioned.armor.map((p) => p.ref)).toEqual(["light-armor"]);
        expect(partitioned.tools.map((p) => p.label)).toEqual(["Smith's Tools"]);
        expect(partitioned.other.map((p) => p.ref)).toEqual(["mystery-prof"]);
        expect(partitioned.languages.map((p) => p.label)).toEqual(["Elvish"]);
    });

    it("humanizes labels when name is missing", () => {
        const partitioned = partitionProficiencies(grants, dndSkills);

        expect(partitioned.weapons[0]?.label).toBe("Martial Weapons");
        expect(partitioned.armor[0]?.label).toBe("Light Armor");
    });
});
