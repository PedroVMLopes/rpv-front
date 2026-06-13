import {
    listRaceOptions,
    listSubraceOptions,
} from "../lib/catalog/raceCatalog";

describe("raceCatalog options", () => {
    it("returns slug/value and localized label for races", () => {
        const options = listRaceOptions("en");

        expect(options.length).toBeGreaterThan(0);
        expect(options).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ value: "elf", label: "Elf" }),
                expect.objectContaining({ value: "dwarf", label: "Dwarf" }),
            ])
        );
    });

    it("returns localized race labels for pt-BR", () => {
        const options = listRaceOptions("pt-BR");

        expect(options).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ value: "elf", label: "Elfo" }),
                expect.objectContaining({ value: "dwarf", label: "Anão" }),
            ])
        );
    });

    it("returns subrace options for a given race slug", () => {
        expect(listSubraceOptions("elf", "en")).toEqual([
            { value: "high-elf", label: "High Elf" },
        ]);
        expect(listSubraceOptions("dwarf", "en")).toEqual([
            { value: "hill-dwarf", label: "Hill Dwarf" },
        ]);
    });

    it("returns empty subrace options when race slug is missing or unknown", () => {
        expect(listSubraceOptions(undefined)).toEqual([]);
        expect(listSubraceOptions("unknown-race")).toEqual([]);
    });
});
