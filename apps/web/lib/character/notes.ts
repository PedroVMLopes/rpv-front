import {
    NOTE_COLORS,
    type CharacterNote,
    type NoteColor,
    type NoteVisibility,
} from "./storedCharacter";

export type NoteColorChoice = NoteColor | "default";

export const NOTE_BODY_MAX_LENGTH = 1200;
export const NOTE_REMAINING_COUNTER_AT = 200;

export function isBlankNoteBody(body: string): boolean {
    return body.trim().length === 0;
}

export function clampNoteInput(body: string): string {
    return body.slice(0, NOTE_BODY_MAX_LENGTH);
}

export function clampNoteBody(body: string): string {
    return body.trim().slice(0, NOTE_BODY_MAX_LENGTH);
}

export function splitNoteBody(body: string): { title: string; rest: string } {
    const newline = body.indexOf("\n");
    if (newline === -1) {
        return { title: body, rest: "" };
    }

    return {
        title: body.slice(0, newline),
        rest: body.slice(newline + 1),
    };
}

export function createCharacterNote(body: string): CharacterNote | null {
    const nextBody = clampNoteBody(body);
    if (nextBody.length === 0) {
        return null;
    }

    const now = new Date().toISOString();

    return {
        id: crypto.randomUUID(),
        body: nextBody,
        createdAt: now,
        updatedAt: now,
        visibility: "private",
    };
}

export function updateCharacterNote(
    note: CharacterNote,
    body: string,
    color?: NoteColorChoice
): CharacterNote | null {
    const nextBody = clampNoteBody(body);
    if (nextBody.length === 0) {
        return null;
    }

    const next: CharacterNote = {
        ...note,
        body: nextBody,
        updatedAt: new Date().toISOString(),
    };

    if (color === undefined) {
        return next;
    }

    if (color === "default") {
        const { color: _removed, ...withoutColor } = next;
        return withoutColor;
    }

    return { ...next, color };
}

function isIsoDateString(value: unknown): value is string {
    return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function coerceVisibility(_value: unknown): NoteVisibility {
    return "private";
}

function coerceNoteColor(value: unknown): NoteColor | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    return NOTE_COLORS.find((color) => color === value);
}

function sanitizeCharacterNote(value: unknown): CharacterNote | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const record = value as Record<string, unknown>;
    if (typeof record.id !== "string" || record.id.length === 0) {
        return null;
    }

    if (typeof record.body !== "string") {
        return null;
    }

    const body = clampNoteBody(record.body);
    if (body.length === 0) {
        return null;
    }

    if (!isIsoDateString(record.createdAt)) {
        return null;
    }

    const updatedAt = isIsoDateString(record.updatedAt)
        ? record.updatedAt
        : record.createdAt;

    const color = coerceNoteColor(record.color);

    return {
        id: record.id,
        body,
        createdAt: record.createdAt,
        updatedAt,
        visibility: coerceVisibility(record.visibility),
        ...(color ? { color } : {}),
    };
}

export function sanitizeCharacterNotes(value: unknown): CharacterNote[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((entry) => {
        const note = sanitizeCharacterNote(entry);
        return note ? [note] : [];
    });
}

export function listCharacterNotes(
    notes: CharacterNote[] | undefined
): CharacterNote[] {
    return sanitizeCharacterNotes(notes).sort((left, right) => {
        const byDate = right.createdAt.localeCompare(left.createdAt);
        if (byDate !== 0) {
            return byDate;
        }

        return right.id.localeCompare(left.id);
    });
}

export function formatNoteTimestamp(iso: string, locale: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}
