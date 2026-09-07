import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type {
    Open5eV2Item,
    Open5eV2Weapon,
} from "../src/open5e/open5e.types";
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

function mapWeaponItem(weapon: Partial<Open5eV2Weapon> = {}): ReturnType<
    typeof mapOpen5eItem
> {
    const raw: Open5eV2Item = {
        key: "test_weapon",
        name: "Test Weapon",
        desc: "",
        category: { name: "Weapon", key: "weapon" },
        weapon: {
            name: "Test Weapon",
            key: "test_weapon",
            damage_type: { name: "Piercing", key: "piercing" },
            damage_dice: "1d6",
            properties: [],
            is_simple: true,
            is_martial: false,
            is_improvised: false,
            ...weapon,
        },
        armor: null,
        weight: null,
        weight_unit: null,
        cost: null,
        document: { name: "SRD", key: "srd" },
    };

    return mapOpen5eItem(raw);
}

describe("mapOpen5eItem range fallbacks", () => {
    it("prefers Open5e range fields over ammunition detail", () => {
        const mapped = mapWeaponItem({
            range: 30,
            long_range: 120,
            properties: [
                {
                    property: {
                        name: "Ammunition",
                        type: null,
                        desc: "",
                    },
                    detail: "range 150/600",
                },
            ],
        });

        expect(mapped.weapon?.range).toBe(30);
        expect(mapped.weapon?.longRange).toBe(120);
    });

    it("parses a single-number ammunition detail as range only", () => {
        const mapped = mapWeaponItem({
            properties: [
                {
                    property: {
                        name: "Ammunition",
                        type: null,
                        desc: "",
                    },
                    detail: "range 80",
                },
            ],
        });

        expect(mapped.weapon?.range).toBe(80);
        expect(mapped.weapon?.longRange).toBeNull();
    });

    it("skips blank ammunition detail and ignores non-range properties", () => {
        const mapped = mapWeaponItem({
            properties: [
                {
                    property: {
                        name: "Ammunition",
                        type: null,
                        desc: "",
                    },
                    detail: null,
                },
                {
                    property: {
                        name: "Versatile",
                        type: null,
                        desc: "",
                    },
                    detail: "1d10",
                },
                {
                    property: {
                        name: "Thrown",
                        type: null,
                        desc: "",
                    },
                    detail: "20/60",
                },
            ],
        });

        expect(mapped.weapon?.range).toBe(20);
        expect(mapped.weapon?.longRange).toBe(60);
        expect(mapped.stackable).toBe(false);
    });
});
