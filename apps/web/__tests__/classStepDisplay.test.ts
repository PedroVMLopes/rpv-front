import {
    partitionClassGrantsForLevel,
    summarizeClassStartingEquipment,
} from "../lib/character/classStepDisplay";

describe("classStepDisplay", () => {
    it("partitions fighter L1 fixed proficiencies and skill choices scope", () => {
        const { fixedDisplayGrants } = partitionClassGrantsForLevel("fighter", 1);

        const labels = fixedDisplayGrants.map((grant) => grant.ref);

        expect(labels).toEqual(
            expect.arrayContaining([
                "strength",
                "constitution",
                "light-armor",
                "medium-armor",
                "heavy-armor",
                "shields",
                "simple-weapons",
                "martial-weapons",
            ])
        );
    });

    it("includes wizard L1 spell slot resources", () => {
        const { fixedDisplayGrants } = partitionClassGrantsForLevel("wizard", 1);

        expect(
            fixedDisplayGrants.some(
                (grant) => grant.kind === "resource" && grant.ref === "spell-slots-1"
            )
        ).toBe(true);
    });

    it("summarizes fighter starting equipment branches", () => {
        expect(summarizeClassStartingEquipment("fighter", 1)).toBe(
            "equipment or 50 gp"
        );
    });
});
