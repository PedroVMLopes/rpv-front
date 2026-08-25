"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { NoteComposer } from "@/components/characters/PlayerSheet/notes/NoteComposer";
import {
    formatNoteTimestamp,
    isBlankNoteBody,
    splitNoteBody,
} from "@/lib/character/notes";
import type { CharacterNote } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";

type NoteDetailModalProps = {
    characterId: string;
    note: CharacterNote;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function NoteDetailModal({
    characterId,
    note,
    open,
    onOpenChange,
}: NoteDetailModalProps) {
    const t = useTranslations("playerSheet.notes");
    const locale = useLocale();
    const updateNote = useCharacterStore((state) => state.updateNote);
    const deleteNote = useCharacterStore((state) => state.deleteNote);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(note.body);
    const { title, rest } = splitNoteBody(note.body);
    const stamped = formatNoteTimestamp(note.createdAt, locale);

    useEffect(() => {
        if (!open) {
            setEditing(false);
            return;
        }

        setDraft(note.body);
        setEditing(false);
    }, [open, note.id, note.body]);

    const closeModal = () => onOpenChange(false);

    const handleClose = () => {
        if (editing) {
            setDraft(note.body);
            setEditing(false);
            return;
        }

        closeModal();
    };

    const handleSave = () => {
        if (isBlankNoteBody(draft)) {
            setDraft(note.body);
            setEditing(false);
            return;
        }

        updateNote(characterId, note.id, draft);
        setEditing(false);
    };

    const handleDelete = () => {
        deleteNote(characterId, note.id);
        closeModal();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg bg-card text-card-foreground"
            >
                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                    <DialogHeader>
                        <DialogTitle className="sr-only">
                            {title || t("bodyLabel")}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            {t("bodyLabel")}
                        </DialogDescription>
                    </DialogHeader>
                    {editing ? (
                        <NoteComposer
                            body={draft}
                            onChange={setDraft}
                            autoFocus
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
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
                        </div>
                    )}
                </div>
                <DialogFooter className="flex-col gap-2 border-t border-border px-6 py-4 sm:flex-col sm:space-x-0">
                    <div className="grid w-full grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            {t("close")}
                        </Button>
                        {editing ? (
                            <Button type="button" onClick={handleSave}>
                                {t("saveNote")}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => setEditing(true)}
                            >
                                {t("edit")}
                            </Button>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        className="w-full"
                        onClick={handleDelete}
                    >
                        {t("delete")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
