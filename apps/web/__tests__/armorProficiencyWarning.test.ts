import { emptyInventory } from "@rpv/domain";
import type { CharacterGrant } from "@rpv/domain";
import {
    itemLacksArmorProficiency,
    listEquippedArmorProficiencyWarnings,
} from "../lib/character/armorProficiencyWarning";
import { getItem } from "@rpv/content";

const wizardGrants: CharacterGrant[] = [];
const fighterArmor: CharacterGrant = {
    id: "class-fighter-armor_proficiency-heavy-armor-0",
    kind: "proficiency",
    ref: "heavy-armor",
    source: { type: "class", id: "fighter" },
};

describe("armorProficiencyWarning", () => {
    it("flags plate on a character without heavy armor proficiency", () => {
        expect(
            itemLacksArmorProficiency(getItem("srd_plate-armor")!, wizardGrants)
        ).toBe(true);
        expect(
            itemLacksArmorProficiency(getItem("srd_plate-armor")!, [
                fighterArmor,
            ])
        ).toBe(false);
    });

    it("lists equipped armor that the character is not proficient with", () => {
        const inventory = {
            ...emptyInventory(),
            equipped: { armor: "srd_plate-armor" },
        };

        expect(
            listEquippedArmorProficiencyWarnings(
                inventory,
                wizardGrants,
                "dnd"
            ).map((item) => item.slug)
        ).toEqual(["srd_plate-armor"]);
    });
});
