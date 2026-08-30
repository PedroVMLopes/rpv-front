import {
    canEquipItem,
    deriveItemEquipPolicy,
    getEquipableSlotIds,
    getItem,
    isItemEquippable,
    resolveItemEquipPolicy,
    type ItemEntry,
} from "../src";

describe("deriveItemEquipPolicy", () => {
    it.each([
        ["srd_waterskin", "carried"],
        ["srd_longsword", "wieldable"],
        ["srd_leather-armor", "wearable"],
        ["srd_shield", "shield"],
        ["srd_arrow-bow", "carried"],
        ["srd_clothes-travelers", "cosmetic"],
        ["srd_robes", "cosmetic"],
        ["srd_signet-ring", "cosmetic"],
        ["srd_wooden-staff", "wieldable"],
        ["rpv_amulet-of-vitality", "granted"],
        ["rpv_ring-of-hardiness", "granted"],
    ] as const)("derives %s as %s", (slug, policy) => {
        expect(deriveItemEquipPolicy(getItem(slug, "dnd")!)).toBe(policy);
    });
});

describe("resolveItemEquipPolicy", () => {
    it("uses equipPolicy override when set", () => {
        const item: ItemEntry = {
            slug: "test-carried-weapon",
            system: "dnd",
            name: "Test",
            description: "",
            category: { name: "Weapon", key: "weapon" },
            weapon: {
                key: "test",
                name: "Test",
                damageDice: "1d4",
                damageType: { name: "Piercing", key: "piercing" },
                properties: [],
                isSimple: true,
                isMartial: false,
                isImprovised: false,
                distanceUnit: null,
            },
            armor: null,
            weight: null,
            weightUnit: null,
            cost: null,
            grants: [],
            stackable: false,
            equipPolicy: "carried",
        };

        expect(resolveItemEquipPolicy(item)).toBe("carried");
    });

    it("resolves scroll pilot override as wieldable", () => {
        expect(resolveItemEquipPolicy(getItem("rpv_scroll-of-fire-bolt", "dnd")!)).toBe(
            "wieldable"
        );
    });
});

describe("getEquipableSlotIds", () => {
    it("returns empty for carried items", () => {
        expect(getEquipableSlotIds(getItem("srd_waterskin", "dnd")!)).toEqual([]);
    });

    it("returns cosmetic slot for clothes", () => {
        expect(getEquipableSlotIds(getItem("srd_clothes-travelers", "dnd")!)).toEqual([
            "cosmetic",
        ]);
    });

    it("returns hand slots for wieldable override scroll", () => {
        expect(getEquipableSlotIds(getItem("rpv_scroll-of-fire-bolt", "dnd")!)).toEqual([
            "melee-main",
            "melee-off",
            "ranged-main",
            "ranged-off",
        ]);
    });

    it("returns wearable and hand slots for granted amulet", () => {
        const slots = getEquipableSlotIds(getItem("rpv_amulet-of-vitality", "dnd")!);
        expect(slots).toContain("amulet");
        expect(slots).toContain("melee-main");
        expect(slots).not.toContain("usable");
    });
});

describe("isItemEquippable", () => {
    it("is false for carried gear", () => {
        expect(isItemEquippable(getItem("srd_waterskin", "dnd")!)).toBe(false);
    });

    it("is true for weapons", () => {
        expect(isItemEquippable(getItem("srd_longsword", "dnd")!)).toBe(true);
    });
});

describe("canEquipItem", () => {
    it.each([
        ["srd_waterskin", "melee-main", false],
        ["srd_longsword", "melee-main", true],
        ["srd_longsword", "breast", false],
        ["srd_clothes-travelers", "cosmetic", true],
        ["srd_clothes-travelers", "melee-main", false],
        ["rpv_scroll-of-fire-bolt", "melee-main", true],
        ["rpv_scroll-of-fire-bolt", "amulet", false],
        ["rpv_amulet-of-vitality", "amulet", true],
        ["srd_shield", "melee-off", true],
    ] as const)("%s in %s → %s", (slug, slotId, expected) => {
        expect(canEquipItem(slug, slotId, "dnd")).toBe(expected);
    });

    it("rejects legacy multi usable slot", () => {
        expect(canEquipItem("srd_longsword", "usable", "dnd")).toBe(false);
    });

    it("returns false for unknown slug", () => {
        expect(canEquipItem("not-a-real-item", "melee-main", "dnd")).toBe(false);
    });
});
