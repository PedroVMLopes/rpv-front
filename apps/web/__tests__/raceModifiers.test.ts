import { deriveRaceModifiers } from "../lib/character/raceModifiers";

describe("deriveRaceModifiers", () => {
    it("derives elf dexterity bonus from race selection", () => {
        const modifiers = deriveRaceModifiers({ race: "elf" }, "en");

        expect(modifiers).toEqual([
            {
                id: "race-elf-dexterity",
                stat: "dexterity",
                operation: "add",
                value: 2,
                source: { type: "race", id: "elf" },
                duration: { type: "permanent" },
                stacking: "stack",
                priority: 0,
            },
        ]);
    });

    it("derives dwarf and hill-dwarf bonuses from race + subrace", () => {
        const modifiers = deriveRaceModifiers(
            { race: "dwarf", subrace: "hill-dwarf" },
            "en"
        );

        expect(modifiers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: "race-dwarf-constitution",
                    stat: "constitution",
                    value: 2,
                    source: { type: "race", id: "dwarf" },
                }),
                expect.objectContaining({
                    id: "race-hill-dwarf-wisdom",
                    stat: "wisdom",
                    value: 1,
                    source: { type: "race", id: "hill-dwarf" },
                }),
            ])
        );
        expect(modifiers).toHaveLength(2);
    });

    it("returns no modifiers when no race is selected", () => {
        expect(deriveRaceModifiers({}, "en")).toEqual([]);
    });
});
