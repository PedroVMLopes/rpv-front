import { emptyInventory } from "@rpv/domain";
import { collectGrantSources } from "../lib/character/characterGrants";
import { getRace } from "../lib/catalog/raceCatalog";

describe("collectGrantSources via ContentRepository", () => {
    it("uses race.levelGrants from the repository, not a dnd map import", () => {
        const elf = getRace("elf", "en");
        expect(elf?.levelGrants?.length).toBeGreaterThan(0);

        const sources = collectGrantSources(
            {
                race: "elf",
                characterClass: "fighter",
                inventory: emptyInventory(),
                choices: {},
            },
            "en",
            1,
            "dnd"
        );

        const raceSource = sources.find(
            (entry) => entry.source.type === "race" && entry.source.id === "elf"
        );
        expect(raceSource?.grants).toEqual(
            expect.arrayContaining(elf?.levelGrants ?? [])
        );

        const systemSource = sources.find(
            (entry) => entry.source.type === "system"
        );
        expect(systemSource?.source.id).toBe("dnd-basic-combat");
        expect(systemSource?.grants.length).toBeGreaterThan(0);
    });
});
