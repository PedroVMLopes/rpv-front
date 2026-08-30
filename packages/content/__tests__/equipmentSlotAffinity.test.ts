import { getItem, getSuggestedEquipmentSlotIds } from "../src";

describe("getSuggestedEquipmentSlotIds", () => {
    it("suggests breast for body armor", () => {
        expect(
            getSuggestedEquipmentSlotIds(getItem("srd_leather-armor", "dnd")!)
        ).toEqual(["breast"]);
    });

    it("suggests melee-off for shield", () => {
        expect(getSuggestedEquipmentSlotIds(getItem("srd_shield", "dnd")!)).toEqual([
            "melee-off",
        ]);
    });

    it("suggests ranged hands for longbow", () => {
        expect(getSuggestedEquipmentSlotIds(getItem("srd_longbow", "dnd")!)).toEqual([
            "ranged-main",
            "ranged-off",
        ]);
    });

    it("suggests melee hands for longsword", () => {
        expect(
            getSuggestedEquipmentSlotIds(getItem("srd_longsword", "dnd")!)
        ).toEqual(["melee-main", "melee-off"]);
    });

    it("suggests ring slots for rings", () => {
        expect(
            getSuggestedEquipmentSlotIds(getItem("rpv_ring-of-hardiness", "dnd")!)
        ).toEqual(["ring", "ring-2"]);
    });

    it("returns empty for gear without affinity", () => {
        expect(
            getSuggestedEquipmentSlotIds(getItem("srd_arrow-bow", "dnd")!)
        ).toEqual([]);
    });

    it("suggests cosmetic for travelers clothes", () => {
        expect(
            getSuggestedEquipmentSlotIds(getItem("srd_clothes-travelers", "dnd")!)
        ).toEqual(["cosmetic"]);
    });

    it("suggests cosmetic for signet ring", () => {
        expect(
            getSuggestedEquipmentSlotIds(getItem("srd_signet-ring", "dnd")!)
        ).toEqual(["cosmetic"]);
    });

    it("suggests amulet first for granted wondrous item", () => {
        expect(
            getSuggestedEquipmentSlotIds(getItem("rpv_amulet-of-vitality", "dnd")!)
        ).toEqual(["amulet"]);
    });
});
