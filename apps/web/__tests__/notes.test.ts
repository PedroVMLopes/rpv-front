import {
    clampNoteBody,
    clampNoteInput,
    createCharacterNote,
    formatNoteTimestamp,
    isBlankNoteBody,
    listCharacterNotes,
    NOTE_BODY_MAX_LENGTH,
    sanitizeCharacterNotes,
    splitNoteBody,
    updateCharacterNote,
} from "../lib/character/notes";

describe("character notes helpers", () => {
    it("treats whitespace-only bodies as blank", () => {
        expect(isBlankNoteBody("")).toBe(true);
        expect(isBlankNoteBody("   \n\t")).toBe(true);
        expect(isBlankNoteBody("Garen")).toBe(false);
    });

    it("trims and caps persisted bodies at 1200 characters", () => {
        const over = `  ${"a".repeat(NOTE_BODY_MAX_LENGTH + 40)}  `;
        expect(clampNoteBody(over)).toHaveLength(NOTE_BODY_MAX_LENGTH);
        expect(clampNoteInput("a".repeat(NOTE_BODY_MAX_LENGTH + 8))).toHaveLength(
            NOTE_BODY_MAX_LENGTH
        );
    });

    it("splits the first line as title and the rest as body", () => {
        expect(splitNoteBody("Garen")).toEqual({ title: "Garen", rest: "" });
        expect(splitNoteBody("Garen\nThe barkeep")).toEqual({
            title: "Garen",
            rest: "The barkeep",
        });
        expect(splitNoteBody("Garen\nline two\nline three")).toEqual({
            title: "Garen",
            rest: "line two\nline three",
        });
    });

    it("creates a private note with timestamps or returns null when blank", () => {
        expect(createCharacterNote("   ")).toBeNull();

        const note = createCharacterNote("  owed a favor  ");
        expect(note).toMatchObject({
            body: "owed a favor",
            visibility: "private",
        });
        expect(note?.id).toEqual(expect.any(String));
        expect(note?.createdAt).toEqual(note?.updatedAt);
        expect(Number.isNaN(Date.parse(note?.createdAt ?? ""))).toBe(false);
        expect(note?.color).toBeUndefined();
    });

    it("updates a note body and timestamp or returns null when blank", () => {
        const created = createCharacterNote("Garen")!;
        expect(updateCharacterNote(created, "   ")).toBeNull();

        const updated = updateCharacterNote(created, "  Garen the barkeep  ");
        expect(updated).toMatchObject({
            id: created.id,
            body: "Garen the barkeep",
            createdAt: created.createdAt,
            visibility: "private",
        });
        expect(Number.isNaN(Date.parse(updated?.updatedAt ?? ""))).toBe(false);
        expect(updated?.color).toBeUndefined();

        const colored = updateCharacterNote(created, "Garen", "yellow");
        expect(colored).toMatchObject({
            id: created.id,
            body: "Garen",
            color: "yellow",
        });

        const cleared = updateCharacterNote(colored!, "Garen", "default");
        expect(cleared?.color).toBeUndefined();
        expect(cleared).not.toHaveProperty("color");
    });

    it("drops invalid notes and keeps a sanitized list newest first", () => {
        expect(sanitizeCharacterNotes(undefined)).toEqual([]);
        expect(
            sanitizeCharacterNotes([
                {
                    id: "keep",
                    body: "  keep me  ",
                    createdAt: "2026-08-24T12:00:00.000Z",
                    updatedAt: "2026-08-24T12:00:00.000Z",
                    visibility: "nope",
                    color: "yellow",
                },
                {
                    id: "invalid-color",
                    body: "keep color fallback",
                    createdAt: "2026-08-24T11:00:00.000Z",
                    updatedAt: "2026-08-24T11:00:00.000Z",
                    visibility: "private",
                    color: "neon",
                },
                { id: "blank", body: "   ", createdAt: "2026-08-24T12:00:00.000Z" },
                { body: "no id", createdAt: "2026-08-24T12:00:00.000Z" },
            ])
        ).toEqual([
            {
                id: "keep",
                body: "keep me",
                createdAt: "2026-08-24T12:00:00.000Z",
                updatedAt: "2026-08-24T12:00:00.000Z",
                visibility: "private",
                color: "yellow",
            },
            {
                id: "invalid-color",
                body: "keep color fallback",
                createdAt: "2026-08-24T11:00:00.000Z",
                updatedAt: "2026-08-24T11:00:00.000Z",
                visibility: "private",
            },
        ]);

        const listed = listCharacterNotes([
            {
                id: "older",
                body: "first",
                createdAt: "2026-08-01T12:00:00.000Z",
                updatedAt: "2026-08-01T12:00:00.000Z",
                visibility: "private",
            },
            {
                id: "newer",
                body: "second",
                createdAt: "2026-08-24T12:00:00.000Z",
                updatedAt: "2026-08-24T12:00:00.000Z",
                visibility: "private",
            },
        ]);
        expect(listed.map((note) => note.id)).toEqual(["newer", "older"]);
    });

    it("formats a valid timestamp for the UI locale", () => {
        expect(formatNoteTimestamp("not-a-date", "en")).toBe("");
        expect(
            formatNoteTimestamp("2026-08-24T15:30:00.000Z", "en")
        ).toMatch(/2026/);
    });
});
