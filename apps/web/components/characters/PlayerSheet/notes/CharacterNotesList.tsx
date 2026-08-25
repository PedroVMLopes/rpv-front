"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { OverviewPanel } from "@/components/characters/PlayerSheet/overview/OverviewPanel";
import { NoteDetailModal } from "@/components/characters/PlayerSheet/notes/NoteDetailModal";
import { noteSurfaceClass } from "@/components/characters/PlayerSheet/notes/noteColors";
import {
    formatNoteTimestamp,
    listCharacterNotes,
    splitNoteBody,
} from "@/lib/character/notes";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { cn } from "@/lib/utils";

type CharacterNotesListProps = {
    stored: StoredCharacter;
};

export function CharacterNotesList({ stored }: CharacterNotesListProps) {
    const tPersona = useTranslations("playerSheet.persona");
    const tNotes = useTranslations("playerSheet.notes");
    const locale = useLocale();
    const [openNoteId, setOpenNoteId] = useState<string | null>(null);
    const liveNotes = useCharacterStore((state) => {
        const match = state.characters.find(
            (character) => character.id === stored.id
        );
        return match?.notes ?? stored.notes;
    });
    const notes = listCharacterNotes(liveNotes);
    const openNote = notes.find((note) => note.id === openNoteId) ?? null;

    return (
        <OverviewPanel title={tPersona("notesBlockTitle")}>
            {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {tNotes("empty")}
                </p>
            ) : (
                <ul className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note) => {
                        const { title, rest } = splitNoteBody(note.body);
                        const stamped = formatNoteTimestamp(
                            note.createdAt,
                            locale
                        );

                        return (
                            <li
                                key={note.id}
                                className={cn(
                                    "flex flex-col rounded-xl px-3 py-2 border-custom border-background",
                                    noteSurfaceClass(note.color, "card")
                                )}
                            >
                                <div className="flex items-start justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="size-6 shrink-0 cursor-pointer"
                                        aria-label={tNotes("expand", {
                                            title: title || tNotes("bodyLabel"),
                                        })}
                                        onClick={() => setOpenNoteId(note.id)}
                                    >
                                        <Maximize2 aria-hidden />
                                    </Button>
                                </div>
                                <p className="whitespace-pre-wrap wrap-break-word text-lg font-semibold leading-7">
                                    {title}
                                </p>
                                {rest.length > 0 ? (
                                    <p className="line-clamp-3 whitespace-pre-wrap wrap-break-word text-sm leading-6">
                                        {rest}
                                    </p>
                                ) : null}
                                {stamped ? (
                                    <p className="mt-auto pt-2 text-xs text-muted-foreground">
                                        {stamped}
                                    </p>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            )}
            {openNote ? (
                <NoteDetailModal
                    characterId={stored.id}
                    note={openNote}
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setOpenNoteId(null);
                        }
                    }}
                />
            ) : null}
        </OverviewPanel>
    );
}
