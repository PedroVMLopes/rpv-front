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

describe("formatClassStepGrantLabel", () => {
    const translateAbility = (ref: string) =>
        ({ strength: "Strength", wisdom: "Wisdom" }[ref] ?? ref);
    const translateResource = (ref: string) =>
        ({ "rage-uses": "Rage" }[ref] ?? ref);
    const translateSpellSlots = (
        key: "spellSlotsGrouped" | "spellSlotsGroupedDelta",
        values: { level: number; count: number }
    ) =>
        key === "spellSlotsGrouped"
            ? `Spell Slots L${values.level}: ${values.count}`
            : `Spell Slots L${values.level}: +${values.count}`;

    const grant = (
        partial: Partial<CharacterGrant> &
            Pick<CharacterGrant, "kind" | "ref">
    ): CharacterGrant => ({
        id: "grant",
        source: { type: "class", id: "fighter" },
        ...partial,
    });

    it("prefers an authored name", () => {
        expect(
            formatClassStepGrantLabel(
                grant({ kind: "ability", ref: "second-wind", name: "Second Wind" }),
                "en",
                translateAbility,
                translateResource
            )
        ).toBe("Second Wind");
    });

    it("formats spell-slot resources with and without a translator", () => {
        const slot = grant({
            kind: "resource",
            ref: "spell-slots-1",
            amount: 4,
        });

        expect(
            formatClassStepGrantLabel(
                slot,
                "en",
                translateAbility,
                translateResource,
                translateSpellSlots
            )
        ).toBe("Spell Slots L1: 4");
        expect(
            formatClassStepGrantLabel(
                slot,
                "en",
                translateAbility,
                translateResource
            )
        ).toBe("L1 spell slots: 4");
    });

    it("labels saving-throw proficiencies and humanizes other refs", () => {
        expect(
            formatClassStepGrantLabel(
                grant({ kind: "proficiency", ref: "strength" }),
                "en",
                translateAbility,
                translateResource
            )
        ).toBe("Strength save");
        expect(
            formatClassStepGrantLabel(
                grant({ kind: "saving_throw", ref: "wisdom" }),
                "en",
                translateAbility,
                translateResource
            )
        ).toBe("Wisdom save");
        expect(
            formatClassStepGrantLabel(
                grant({ kind: "resource", ref: "rage-uses", amount: 2 }),
                "en",
                translateAbility,
                translateResource
            )
        ).toBe("Rage: 2");
        expect(
            formatClassStepGrantLabel(
                grant({ kind: "proficiency", ref: "martial-weapons" }),
                "en",
                translateAbility,
                translateResource
            )
        ).toBe("Martial Weapons");
    });
});
