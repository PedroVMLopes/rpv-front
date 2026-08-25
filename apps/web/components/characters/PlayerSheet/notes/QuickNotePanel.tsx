"use client";

import { useEffect, useRef, useState, type UIEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    clampNoteInput,
    isBlankNoteBody,
    NOTE_BODY_MAX_LENGTH,
    NOTE_REMAINING_COUNTER_AT,
    splitNoteBody,
} from "@/lib/character/notes";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { cn } from "@/lib/utils";

type QuickNotePanelProps = {
    stored: StoredCharacter;
    onDismiss: () => void;
};

const fieldAlign =
    "whitespace-pre-wrap wrap-break-word px-1 py-1 leading-7";

function NoteComposerPreview({ body }: { body: string }) {
    const { title, rest } = splitNoteBody(body);
    const hasBreak = body.includes("\n");

    if (body.length === 0) {
        return null;
    }

    return (
        <>
            <span className="text-lg font-semibold leading-7">
                {title.length > 0 ? title : "\u00a0"}
            </span>
            {hasBreak ? (
                <>
                    {"\n"}
                    <span className="text-sm font-normal leading-7">{rest}</span>
                </>
            ) : null}
        </>
    );
}

export function QuickNotePanel({ stored, onDismiss }: QuickNotePanelProps) {
    const t = useTranslations("playerSheet.notes");
    const addNote = useCharacterStore((state) => state.addNote);
    const [body, setBody] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const remaining = NOTE_BODY_MAX_LENGTH - body.length;
    const showRemaining = remaining <= NOTE_REMAINING_COUNTER_AT;

    const syncPreviewScroll = (event: UIEvent<HTMLTextAreaElement>) => {
        const preview = previewRef.current;
        if (!preview) {
            return;
        }

        preview.scrollTop = event.currentTarget.scrollTop;
    };

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
            <div className="relative min-h-48 flex-1">
                <div
                    ref={previewRef}
                    aria-hidden
                    className={cn(
                        "pointer-events-none absolute inset-0 overflow-hidden text-card-foreground",
                        fieldAlign
                    )}
                >
                    <NoteComposerPreview body={body} />
                </div>
                <textarea
                    ref={textareaRef}
                    value={body}
                    maxLength={NOTE_BODY_MAX_LENGTH}
                    aria-label={t("bodyLabel")}
                    placeholder={t("placeholder")}
                    className={cn(
                        "relative z-10 h-full min-h-48 w-full resize-none overflow-y-auto bg-transparent text-base text-transparent caret-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0",
                        fieldAlign
                    )}
                    onChange={(event) =>
                        setBody(clampNoteInput(event.target.value))
                    }
                    onScroll={syncPreviewScroll}
                />
            </div>
            <div className="flex flex-col gap-1">
                {showRemaining ? (
                    <p className="text-right text-xs text-muted-foreground">
                        {t("remaining", {
                            count: body.length,
                            max: NOTE_BODY_MAX_LENGTH,
                        })}
                    </p>
                ) : null}
                <Button type="button" className="w-full" onClick={handleSave}>
                    {t("saveNote")}
                </Button>
            </div>
        </div>
    );
}
