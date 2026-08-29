import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { Open5eV2Item } from "../src/open5e/open5e.types";
import { mapOpen5eItem } from "../src/item/item.mapper";

const FIXTURES = join(__dirname, "fixtures", "items");

function readFixtures(): Open5eV2Item[] {
    return readdirSync(FIXTURES)
        .filter((file) => file.endsWith(".json"))
        .map(
            (file) =>
                JSON.parse(readFileSync(join(FIXTURES, file), "utf-8")) as Open5eV2Item
        );
}

describe("mapOpen5eItem", () => {
    const byKey = Object.fromEntries(
        readFixtures().map((raw) => [raw.key, mapOpen5eItem(raw)])
    );

    it("uses Open5e key as slug without stripping", () => {
        expect(byKey.srd_longsword.slug).toBe("srd_longsword");
        expect(byKey["srd_leather-armor"].slug).toBe("srd_leather-armor");
        expect(byKey.srd_shield.slug).toBe("srd_shield");
    });

    it("maps weapon nested profile for longsword", () => {
        const longsword = byKey.srd_longsword;
        expect(longsword.category).toEqual({ name: "Weapon", key: "weapon" });
        expect(longsword.weapon).toEqual(
            expect.objectContaining({
                damageDice: "1d8",
                damageType: { name: "Slashing", key: "slashing" },
                isMartial: true,
                isSimple: false,
            })
        );
        expect(longsword.weapon?.properties).toEqual([
            expect.objectContaining({
                name: "Versatile",
                detail: "1d10",
            }),
        ]);
        expect(longsword.armor).toBeNull();
        expect(longsword.stackable).toBe(false);
        expect(longsword.grants).toEqual([]);
        expect(longsword.cost).toBe("15.00");
        expect(longsword.weight).toBe("3.000");
    });

    it("maps armor nested profile for leather armor", () => {
        const leather = byKey["srd_leather-armor"];
        expect(leather.category.key).toBe("armor");
        expect(leather.armor).toEqual(
            expect.objectContaining({
                category: "light",
                acBase: 11,
                acAddDexmod: true,
                acCapDexmod: null,
                grantsStealthDisadvantage: false,
            })
        );
        expect(leather.weapon).toBeNull();
        expect(leather.stackable).toBe(false);
        expect(leather.grants).toEqual([]);
    });

    it("maps shield category; Open5e 2014 leaves nested armor null", () => {
        const shield = byKey.srd_shield;
        expect(shield.category.key).toBe("shield");
        expect(shield.armor).toBeNull();
        expect(shield.weapon).toBeNull();
        expect(shield.stackable).toBe(true);
    });

    it("fills longbow range from Ammunition property detail", () => {
        const longbow = byKey.srd_longbow;
        expect(longbow.weapon?.range).toBe(150);
        expect(longbow.weapon?.longRange).toBe(600);
    });

    it("fills dagger range from Thrown property detail", () => {
        const dagger = byKey.srd_dagger;
        expect(dagger.weapon?.range).toBe(20);
        expect(dagger.weapon?.longRange).toBe(60);
    });
});
