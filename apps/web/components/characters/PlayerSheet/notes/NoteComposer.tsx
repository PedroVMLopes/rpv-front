"use client";

import { useEffect, useRef, type UIEvent } from "react";
import { useTranslations } from "next-intl";
import {
    clampNoteInput,
    NOTE_BODY_MAX_LENGTH,
    NOTE_REMAINING_COUNTER_AT,
    splitNoteBody,
} from "@/lib/character/notes";
import { cn } from "@/lib/utils";

type NoteComposerProps = {
    body: string;
    onChange: (body: string) => void;
    autoFocus?: boolean;
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

export function NoteComposer({
    body,
    onChange,
    autoFocus = false,
}: NoteComposerProps) {
    const t = useTranslations("playerSheet.notes");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const remaining = NOTE_BODY_MAX_LENGTH - body.length;
    const showRemaining = remaining <= NOTE_REMAINING_COUNTER_AT;

    useEffect(() => {
        if (autoFocus) {
            textareaRef.current?.focus();
        }
    }, [autoFocus]);

    const syncPreviewScroll = (event: UIEvent<HTMLTextAreaElement>) => {
        const preview = previewRef.current;
        if (!preview) {
            return;
        }

        preview.scrollTop = event.currentTarget.scrollTop;
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-1">
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
                        onChange(clampNoteInput(event.target.value))
                    }
                    onScroll={syncPreviewScroll}
                />
            </div>
            {showRemaining ? (
                <p className="text-right text-xs text-muted-foreground">
                    {t("remaining", {
                        count: body.length,
                        max: NOTE_BODY_MAX_LENGTH,
                    })}
                </p>
            ) : null}
        </div>
    );
}
