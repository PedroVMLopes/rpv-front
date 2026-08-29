import { getItem, itemMatchesWeaponProficiency } from "../src";

describe("itemMatchesWeaponProficiency", () => {
    it("matches martial and simple category refs", () => {
        expect(
            itemMatchesWeaponProficiency(getItem("srd_longsword")!, [
                "martial-weapons",
            ])
        ).toBe(true);
        expect(
            itemMatchesWeaponProficiency(getItem("srd_longsword")!, [
                "simple-weapons",
            ])
        ).toBe(false);
        expect(
            itemMatchesWeaponProficiency(getItem("srd_dagger")!, [
                "simple-weapons",
            ])
        ).toBe(true);
    });

    it("matches specific weapon refs including plurals and slugs", () => {
        const longsword = getItem("srd_longsword")!;
        expect(itemMatchesWeaponProficiency(longsword, ["longsword"])).toBe(
            true
        );
        expect(itemMatchesWeaponProficiency(longsword, ["longswords"])).toBe(
            true
        );
        expect(
            itemMatchesWeaponProficiency(longsword, ["srd_longsword"])
        ).toBe(true);
        expect(itemMatchesWeaponProficiency(longsword, ["longbow"])).toBe(
            false
        );
    });
});
