import {
    getBackground,
    getClass,
    getContentRepository,
    listBackgrounds,
    listClasses,
    listSpells,
    StaticContentRepository,
} from "../src";
import {
    readBackground,
    readClass,
    readListBackgrounds,
    readListClasses,
} from "../src/curation/curationReaders";

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
        expect(getBackground("sage")).toEqual(repo.getBackground("sage"));
        expect(listBackgrounds()).toEqual(repo.listBackgrounds());
        expect(getBackground("sage", "pt-BR")).toEqual(
            repo.getBackground("sage", "pt-BR")
        );
        expect(listBackgrounds("pt-BR")).toEqual(repo.listBackgrounds("pt-BR"));
    });

    it("reads backgrounds consistently with curationReaders", () => {
        expect(repo.getBackground("sage")?.slug).toBe("sage");
        expect(repo.listBackgrounds().map((entry) => entry.slug)).toEqual(
            readListBackgrounds().map((entry) => entry.slug)
        );
        expect(repo.getBackground("sage", "pt-BR")).toEqual(
            readBackground("sage", "pt-BR")
        );
    });

    it("returns the same instance from getContentRepository", () => {
        expect(getContentRepository("dnd")).toBe(getContentRepository("dnd"));
    });

    it("attaches race levelGrants on getRace and listRaces", () => {
        const elf = repo.getRace("elf");
        expect(elf?.levelGrants?.some((grant) => grant.grantType === "language")).toBe(
            true
        );
        expect(
            repo.listRaces().find((race) => race.slug === "elf")?.levelGrants
        ).toEqual(elf?.levelGrants);
    });

    it("exposes equipment slots, natural weapons, system grants, and packs", () => {
        expect(repo.listEquipmentSlots().some((slot) => slot.id === "melee-main")).toBe(
            true
        );
        expect(repo.getNaturalWeapons().some((weapon) => weapon.slug === "unarmed-strike")).toBe(
            true
        );
        expect(repo.systemCombatSourceId).toBe("dnd-basic-combat");
        expect(repo.getSystemCombatGrants().length).toBeGreaterThan(0);
        expect(repo.getEquipmentPack("dungeoneers-pack")?.optionType).toBe(
            "inventory_bundle"
        );
        expect(repo.getEquipmentPack("missing")).toBeUndefined();
        expect(repo.listFeats()).toEqual([]);
        expect(repo.getFeat("lucky")).toBeUndefined();
    });
});
