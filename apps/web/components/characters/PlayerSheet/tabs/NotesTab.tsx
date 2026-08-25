"use client";

import { PersonaSection } from "@/components/characters/PlayerSheet/notes/PersonaSection";
import { CharacterNotesList } from "@/components/characters/PlayerSheet/notes/CharacterNotesList";
import type { StoredCharacter } from "@/lib/character/storedCharacter";

type NotesTabProps = {
    stored: StoredCharacter;
};

export function NotesTab({ stored }: NotesTabProps) {
    return (
        <div className="flex flex-col gap-4">
            <PersonaSection stored={stored} />
            <CharacterNotesList stored={stored} />
        </div>
    );
}
