import type { CharacterGrant } from "@rpv/domain";
import {
    formatClassStepGrantLabel,
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

describe("formatClassStepGrantLabel amounts", () => {
    const translateAbility = (ref: string) => ref;
    const translateResource = (ref: string) =>
        ref === "rage-uses" ? "Rage" : ref;
    const translateSpellSlots = (
        _key: "spellSlotsGrouped" | "spellSlotsGroupedDelta",
        values: { level: number; count: number }
    ) => `Spell Slots L${values.level}: ${values.count}`;

    const grant = (
        partial: Partial<CharacterGrant> & Pick<CharacterGrant, "kind" | "ref">
    ): CharacterGrant => ({
        id: "grant",
        source: { type: "class", id: "fighter" },
        ...partial,
    });

    it("omits the count when a named resource has no amount", () => {
        expect(
            formatClassStepGrantLabel(
                grant({ kind: "resource", ref: "rage-uses" }),
                "en",
                translateAbility,
                translateResource
            )
        ).toBe("Rage");
    });

    it("treats missing spell-slot amounts as 0 with a translator, else drops the count", () => {
        const slot = grant({ kind: "resource", ref: "spell-slots-2" });

        expect(
            formatClassStepGrantLabel(
                slot,
                "en",
                translateAbility,
                translateResource,
                translateSpellSlots
            )
        ).toBe("Spell Slots L2: 0");
        expect(
            formatClassStepGrantLabel(
                slot,
                "en",
                translateAbility,
                translateResource
            )
        ).toBe("L2 spell slots");
    });
});
