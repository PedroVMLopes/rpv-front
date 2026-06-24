import {
    flattenStoredToForm,
    formDataToStoredCharacter,
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
});
