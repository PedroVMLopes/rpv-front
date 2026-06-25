import {
    getClass,
    getContentRepository,
    listClasses,
    listSpells,
    StaticContentRepository,
} from "../src";
import { readClass, readListClasses } from "../src/curation/curationReaders";

describe("StaticContentRepository", () => {
    const repo = new StaticContentRepository();

    it("exposes system dnd", () => {
        expect(repo.system).toBe("dnd");
    });

    it("lists bundled spells including L1 wizard spells", () => {
        const spells = repo.listSpells();
        expect(spells.length).toBeGreaterThanOrEqual(12);
        expect(spells.some((spell) => spell.slug === "magic-missile")).toBe(true);
    });

    it("reads classes consistently with curationReaders", () => {
        expect(repo.getClass("fighter")?.slug).toBe("fighter");
        expect(repo.listClasses().map((entry) => entry.slug)).toEqual(
            readListClasses().map((entry) => entry.slug)
        );
        expect(repo.getClass("wizard")).toEqual(readClass("wizard"));
    });

    it("matches legacy wrapper exports", () => {
        expect(getClass("fighter")).toEqual(repo.getClass("fighter"));
        expect(listClasses()).toEqual(repo.listClasses());
        expect(listSpells()).toEqual(repo.listSpells());
    });

    it("returns the same instance from getContentRepository", () => {
        expect(getContentRepository("dnd")).toBe(getContentRepository("dnd"));
    });
});
