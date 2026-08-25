import { act } from "@testing-library/react";
import { flattenStoredToForm } from "../lib/character/characterAdapter";
import { useCharacterStore } from "../store/useCharacterStore";
import { useContentLocale } from "../store/useContentLocale";

const baseAttributes = [
    { name: "strength", value: 10 },
    { name: "dexterity", value: 10 },
    { name: "constitution", value: 14 },
    { name: "intelligence", value: 10 },
    { name: "wisdom", value: 10 },
    { name: "charisma", value: 10 },
];

const baseFormData = {
    name: "Test Hero",
    ac: 12,
    attributes: baseAttributes,
    characterClass: "fighter",
    level: 1,
};

describe("useCharacterStore notes", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    function addBaseCharacter() {
        act(() => {
            useCharacterStore.getState().addCharacter(baseFormData, "player", "dnd");
        });
        return useCharacterStore.getState().characters[0];
    }

    it("starts new characters with an empty notes list", () => {
        const character = addBaseCharacter();
        expect(character.notes).toEqual([]);
    });

    it("appends a note and ignores blank bodies", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addNote(character.id, "   ");
            useCharacterStore.getState().addNote(character.id, "  Garen the barkeep  ");
        });

        const updated = useCharacterStore.getState().characters[0];
        expect(updated.notes).toHaveLength(1);
        expect(updated.notes?.[0]).toMatchObject({
            body: "Garen the barkeep",
            visibility: "private",
        });
    });

    it("keeps notes through a character rebuild", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addNote(character.id, "Owe the thief a favor");
        });

        const withNote = useCharacterStore.getState().characters[0];
        expect(withNote.notes).toHaveLength(1);

        act(() => {
            useCharacterStore.getState().updateCharacter(
                withNote.id,
                flattenStoredToForm(withNote, withNote.system)
            );
        });

        const rebuilt = useCharacterStore.getState().characters[0];
        expect(rebuilt.notes).toEqual(withNote.notes);
    });

    it("updates a note body and ignores blank edits", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addNote(character.id, "Garen");
        });

        const created = useCharacterStore.getState().characters[0].notes![0];

        act(() => {
            useCharacterStore
                .getState()
                .updateNote(character.id, created.id, "   ");
        });

        expect(useCharacterStore.getState().characters[0].notes?.[0].body).toBe(
            "Garen"
        );

        act(() => {
            useCharacterStore
                .getState()
                .updateNote(character.id, created.id, "Garen the barkeep");
        });

        const updated = useCharacterStore.getState().characters[0].notes![0];
        expect(updated.body).toBe("Garen the barkeep");
        expect(updated.id).toBe(created.id);
        expect(updated.createdAt).toBe(created.createdAt);
    });

    it("deletes a note by id", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addNote(character.id, "Keep");
            useCharacterStore.getState().addNote(character.id, "Drop");
        });

        const drop = useCharacterStore
            .getState()
            .characters[0]
            .notes!.find((note) => note.body === "Drop")!;

        act(() => {
            useCharacterStore.getState().deleteNote(character.id, drop.id);
        });

        expect(
            useCharacterStore.getState().characters[0].notes?.map((note) => note.body)
        ).toEqual(["Keep"]);
    });
});
