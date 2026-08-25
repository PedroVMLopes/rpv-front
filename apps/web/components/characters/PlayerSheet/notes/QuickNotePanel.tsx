"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { NoteComposer } from "@/components/characters/PlayerSheet/notes/NoteComposer";
import { isBlankNoteBody } from "@/lib/character/notes";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useState } from "react";

type QuickNotePanelProps = {
    stored: StoredCharacter;
    onDismiss: () => void;
};

export function QuickNotePanel({ stored, onDismiss }: QuickNotePanelProps) {
    const t = useTranslations("playerSheet.notes");
    const addNote = useCharacterStore((state) => state.addNote);
    const [body, setBody] = useState("");

    const handleSave = () => {
        if (isBlankNoteBody(body)) {
            onDismiss();
            return;
        }

        addNote(stored.id, body);
        onDismiss();
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 pb-2">
            <NoteComposer body={body} onChange={setBody} autoFocus />
            <Button type="button" className="w-full" onClick={handleSave}>
                {t("saveNote")}
            </Button>
        </div>
    );
}
