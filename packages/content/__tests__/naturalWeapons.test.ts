import { getNaturalWeapons } from "../src/curation/naturalWeapons.dnd";

describe("getNaturalWeapons", () => {
    it("returns unarmed strike for dnd", () => {
        expect(getNaturalWeapons("dnd")).toEqual([
            expect.objectContaining({
                slug: "unarmed-strike",
                name: "Unarmed Strike",
                attackAbility: "strength",
                alwaysProficient: true,
                damageFlatBase: 1,
                damageType: "bludgeoning",
            }),
        ]);
    });

    it("localizes unarmed strike for pt-BR", () => {
        expect(getNaturalWeapons("dnd", "pt-BR")).toEqual([
            expect.objectContaining({
                slug: "unarmed-strike",
                name: "Ataque desarmado",
            }),
        ]);
    });

    it("returns an empty list for an unknown system", () => {
        expect(getNaturalWeapons("pf2e")).toEqual([]);
    });
});
