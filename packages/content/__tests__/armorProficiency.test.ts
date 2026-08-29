import {
    armorProficiencyRefForItem,
    characterIsProficientWithArmor,
    getItem,
} from "../src";

describe("armorProficiency", () => {
    it("maps body armor and shields to proficiency refs", () => {
        expect(armorProficiencyRefForItem(getItem("srd_leather-armor")!)).toBe(
            "light-armor"
        );
        expect(armorProficiencyRefForItem(getItem("srd_plate-armor")!)).toBe(
            "heavy-armor"
        );
        expect(armorProficiencyRefForItem(getItem("srd_shield")!)).toBe(
            "shields"
        );
        expect(armorProficiencyRefForItem(getItem("srd_longsword")!)).toBeNull();
    });

    it("checks character proficiency refs", () => {
        expect(
            characterIsProficientWithArmor(getItem("srd_plate-armor")!, [
                "heavy-armor",
            ])
        ).toBe(true);
        expect(
            characterIsProficientWithArmor(getItem("srd_plate-armor")!, [
                "light-armor",
            ])
        ).toBe(false);
    });
});
