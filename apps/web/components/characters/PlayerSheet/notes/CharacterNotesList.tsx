"use client";

import { useLocale, useTranslations } from "next-intl";
import { OverviewPanel } from "@/components/characters/PlayerSheet/overview/OverviewPanel";
import { sheetInset } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import {
    formatNoteTimestamp,
    listCharacterNotes,
    splitNoteBody,
} from "@/lib/character/notes";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { cn } from "@/lib/utils";

type CharacterNotesListProps = {
    stored: StoredCharacter;
};

export function CharacterNotesList({ stored }: CharacterNotesListProps) {
    const tPersona = useTranslations("playerSheet.persona");
    const tNotes = useTranslations("playerSheet.notes");
    const locale = useLocale();
    const notes = listCharacterNotes(stored.notes);

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
                                    "flex flex-col rounded-xl px-3 py-2 border-custom border-background bg-popover text-popover-foreground",
                                )}
                            >
                                {stamped ? (
                                    <p className="text-xs text-muted-foreground">
                                        {stamped}
                                    </p>
                                ) : null}
                                <p className="whitespace-pre-wrap wrap-break-word text-lg font-semibold leading-7">
                                    {title}
                                </p>
                                {rest.length > 0 ? (
                                    <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6">
                                        {rest}
                                    </p>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            )}
        </OverviewPanel>
    );
}
