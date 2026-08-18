"use client";

import { useTranslations } from "next-intl";
import { OverviewPanel } from "@/components/characters/PlayerSheet/overview/OverviewPanel";
import { PersonaSection } from "@/components/characters/PlayerSheet/notes/PersonaSection";
import type { StoredCharacter } from "@/lib/character/storedCharacter";

type NotesTabProps = {
    stored: StoredCharacter;
};

export function NotesTab({ stored }: NotesTabProps) {
    const tPersona = useTranslations("playerSheet.persona");
    const tSheet = useTranslations("playerSheet");

    return (
        <div className="flex flex-col gap-4">
            <PersonaSection stored={stored} />
            <OverviewPanel title={tPersona("notesBlockTitle")}>
                <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed p-8">
                    <p className="text-sm text-muted-foreground">
                        {tSheet("comingSoon")}
                    </p>
                </div>
            </OverviewPanel>
        </div>
    );
}
