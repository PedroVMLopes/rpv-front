import { emptyInventory } from "@rpv/domain";
import { listKnownLeveledSpellRefs } from "../lib/character/knownLeveledSpells";
import { sanitizeGrantPicks } from "../lib/character/grantPickSanitize";
import type { CharacterSelections } from "../lib/character/storedCharacter";

function wizardSelections(
    grantPicks: Record<string, string>,
    preparedSpells?: string[]
): CharacterSelections {
    return {
        race: "human",
        characterClass: "wizard",
        inventory: emptyInventory(),
        choices: {
            grantPicks,
            ...(preparedSpells !== undefined ? { preparedSpells } : {}),
        },
    };
}

describe("listKnownLeveledSpellRefs", () => {
    it("returns only leveled spells from grant picks", () => {
        const refs = listKnownLeveledSpellRefs({
            selections: wizardSelections({
                "class:wizard:1:spell:1:0": "fire-bolt",
                "class:wizard:1:spell:2:0": "burning-hands",
                "class:wizard:1:spell:2:1": "magic-missile",
            }),
            locale: "en",
            system: "dnd",
            characterLevel: 1,
        });

        expect(refs).toEqual(["burning-hands", "magic-missile"]);
    });

    it("returns empty when only cantrips are known", () => {
        const refs = listKnownLeveledSpellRefs({
            selections: wizardSelections({
                "class:wizard:1:spell:1:0": "fire-bolt",
            }),
            locale: "en",
            system: "dnd",
            characterLevel: 1,
        });

        expect(refs).toEqual([]);
    });
});

describe("sanitizeGrantPicks preparedSpells prune", () => {
    it("drops prepared slugs that left the book", () => {
        const result = sanitizeGrantPicks(
            wizardSelections(
                {
                    "class:wizard:1:spell:2:0": "burning-hands",
                },
                ["burning-hands", "magic-missile"]
            ),
            "en",
            "dnd",
            1
        );

        expect(result.choices.preparedSpells).toEqual(["burning-hands"]);
    });

    it("preserves preparedSpells when still in book", () => {
        const result = sanitizeGrantPicks(
            wizardSelections(
                {
                    "class:wizard:1:spell:2:0": "burning-hands",
                    "class:wizard:1:spell:2:1": "magic-missile",
                },
                ["burning-hands", "magic-missile"]
            ),
            "en",
            "dnd",
            1
        );

        expect(result.choices.preparedSpells).toEqual([
            "burning-hands",
            "magic-missile",
        ]);
    });

    it("trims preparedSpells to preparedQuota when provided", () => {
        const result = sanitizeGrantPicks(
            wizardSelections(
                {
                    "class:wizard:1:spell:2:0": "burning-hands",
                    "class:wizard:1:spell:2:1": "magic-missile",
                },
                ["burning-hands", "magic-missile"]
            ),
            "en",
            "dnd",
            1,
            { preparedQuota: 1 }
        );

        expect(result.choices.preparedSpells).toEqual(["burning-hands"]);
    });
});
