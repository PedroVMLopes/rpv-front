import {
    buildSelectionsFromForm,
    flattenStoredToForm,
    formDataToStoredCharacter,
    migrateLegacyToStored,
} from "../lib/character/characterAdapter";
import { rebuildStoredCharacter } from "../lib/character/buildCharacter";
import type { StoredCharacter } from "../lib/character/storedCharacter";

describe("inventory round-trip", () => {
    it("preserves multi-item bag and equipped on edit save via flatten + rebuild", () => {
        const stored: StoredCharacter = formDataToStoredCharacter(
            { name: "Hero", attributes: [] },
            "char-multi",
            "player",
            "dnd",
            [],
            {
                race: undefined,
                subrace: undefined,
                characterClass: undefined,
                subclass: undefined,
                background: undefined,
                inventory: {
                    bag: [
                        { slug: "scroll-of-fire-bolt", quantity: 1 },
                        { slug: "amulet-of-vitality", quantity: 2 },
                    ],
                    equipped: { ring: "ring-of-hardiness" },
                },
                choices: {},
            }
        );

        const flattened = flattenStoredToForm(stored, "dnd");
        const rebuilt = rebuildStoredCharacter(stored, flattened, "en");

        expect(flattened).toHaveProperty("inventory");
        expect(rebuilt.selections.inventory.bag).toHaveLength(2);
        expect(rebuilt.selections.inventory.equipped).toEqual({
            ring: "ring-of-hardiness",
        });
    });

    it("migrates legacy items array into inventory bag on migrateLegacyToStored", () => {
        const legacy = {
            id: "legacy-items",
            type: "player",
            system: "dnd",
            name: "Legacy",
            hp: 10,
            maxHp: 10,
            ac: 10,
            attributes: [],
            items: ["scroll-of-fire-bolt", "amulet-of-vitality"],
        };

        const stored = migrateLegacyToStored(legacy);

        expect(stored.selections.inventory.bag).toEqual(
            expect.arrayContaining([
                { slug: "scroll-of-fire-bolt", quantity: 1 },
                { slug: "amulet-of-vitality", quantity: 1 },
            ])
        );
    });

    it("maps legacy items array via buildSelectionsFromForm", () => {
        const selections = buildSelectionsFromForm({
            items: ["scroll-of-fire-bolt", "amulet-of-vitality"],
        });

        expect(selections.inventory.bag).toHaveLength(2);
    });
});
