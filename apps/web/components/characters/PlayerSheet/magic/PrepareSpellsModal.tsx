"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PreparedSpellPicker } from "@/components/characters/creation/spells/PreparedSpellPicker";
import {
    buildPreparedSpellToggleFormData,
    listSheetLockedSpellRefs,
    listSheetPrepareSpellPool,
} from "@/lib/character/sheetPreparedSpells";
import { readPreparedSpells } from "@/lib/character/castableSpells";
import { computePreparedSpellQuotaForStored } from "@/lib/character/preparedSpellQuota";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";

type PrepareSpellsModalProps = {
    stored: StoredCharacter;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function PrepareSpellsModal({
    stored,
    open,
    onOpenChange,
}: PrepareSpellsModalProps) {
    const tMagic = useTranslations("playerSheet.magic");
    const tCreation = useTranslations("characterCreation");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const updateCharacter = useCharacterStore((state) => state.updateCharacter);

    const liveStored =
        useCharacterStore((state) =>
            state.characters.find((character) => character.id === stored.id)
        ) ?? stored;

    const pool = useMemo(
        () => listSheetPrepareSpellPool(liveStored, contentLocale),
        [liveStored, contentLocale]
    );
    const locked = useMemo(
        () => listSheetLockedSpellRefs(liveStored, contentLocale),
        [liveStored, contentLocale]
    );
    const prepared = readPreparedSpells(liveStored.selections.choices);
    const quota = computePreparedSpellQuotaForStored(liveStored) ?? 1;
    const playerPrepared = prepared.filter((slug) => !locked.has(slug));

    const handleToggle = (slug: string) => {
        const formData = buildPreparedSpellToggleFormData(
            liveStored,
            slug,
            contentLocale
        );
        if (!formData) {
            return;
        }
        updateCharacter(liveStored.id, formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-4 overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{tMagic("prepareTitle")}</DialogTitle>
                    <DialogDescription>{tMagic("prepareHelp")}</DialogDescription>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <PreparedSpellPicker
                        pool={pool}
                        prepared={prepared}
                        locked={locked}
                        quota={quota}
                        contentLocale={contentLocale}
                        onToggle={handleToggle}
                        countLabel={tMagic("prepareCount", {
                            prepared: playerPrepared.length,
                            quota,
                        })}
                        emptyLabel={tMagic("prepareEmpty")}
                        expandDetailsLabel={tCreation("selection.expandDetails")}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
