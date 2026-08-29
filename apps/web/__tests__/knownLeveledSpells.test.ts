import { emptyInventory } from "@rpv/domain";
import {
    listKnownLeveledSpellRefs,
    listPrepareSpellPool,
    prunePreparedSpellsToBook,
} from "../lib/character/knownLeveledSpells";
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

function clericSelections(
    preparedSpells?: string[],
    subclass = "cleric-life"
): CharacterSelections {
    return {
        race: "human",
        characterClass: "cleric",
        subclass,
        inventory: emptyInventory(),
        choices: {
            grantPicks: {},
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

describe("listPrepareSpellPool", () => {
    it("uses the cleric class list plus domain spells at L1", () => {
        const refs = listPrepareSpellPool({
            selections: clericSelections(),
            locale: "en",
            system: "dnd",
            characterLevel: 1,
        });

        expect(refs).toEqual(
            expect.arrayContaining([
                "bless",
                "cure-wounds",
                "detect-magic",
                "guiding-bolt",
            ])
        );
        expect(refs).not.toContain("hold-person");
        expect(refs).not.toContain("sacred-flame");
        expect(refs).not.toContain("fire-bolt");
    });

    it("still uses known grants for wizard spellbook", () => {
        const refs = listPrepareSpellPool({
            selections: wizardSelections({
                "class:wizard:1:spell:1:0": "fire-bolt",
                "class:wizard:1:spell:2:0": "burning-hands",
            }),
            locale: "en",
            system: "dnd",
            characterLevel: 1,
        });

        expect(refs).toEqual(["burning-hands"]);
    });
});

describe("prunePreparedSpellsToBook", () => {
    it("returns undefined when prepared spells were never set", () => {
        expect(
            prunePreparedSpellsToBook(undefined, ["burning-hands"])
        ).toBeUndefined();
    });

    it("keeps only slugs still in the known leveled book", () => {
        expect(
            prunePreparedSpellsToBook(
                ["burning-hands", "magic-missile", "fire-bolt"],
                ["burning-hands", "magic-missile"]
            )
        ).toEqual(["burning-hands", "magic-missile"]);
    });

    it("clears prepared slugs when the book is empty", () => {
        expect(prunePreparedSpellsToBook(["burning-hands"], [])).toEqual([]);
        expect(prunePreparedSpellsToBook([], ["burning-hands"])).toEqual([]);
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

    it("keeps cleric prepared slugs that are on the class list", () => {
        const result = sanitizeGrantPicks(
            clericSelections(["guiding-bolt", "fire-bolt"]),
            "en",
            "dnd",
            1
        );

        expect(result.choices.preparedSpells).toEqual(["guiding-bolt"]);
    });
});
