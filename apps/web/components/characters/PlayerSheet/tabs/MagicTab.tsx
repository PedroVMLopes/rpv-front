"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    characterCanPrepareSpells,
} from "@/lib/character/characterHasMagic";
import { computePreparedSpellQuotaForStored } from "@/lib/character/preparedSpellQuota";
import { readPreparedSpells } from "@/lib/character/castableSpells";
import { CastingStatsPanel } from "../combat/CastingStatsPanel";
import { SpellSlotsPanel } from "../magic/SpellSlotsPanel";
import { MagicSpellbookPanel } from "../magic/MagicSpellbookPanel";
import { PrepareSpellsModal } from "../magic/PrepareSpellsModal";
import { OverviewPanel } from "../overview/OverviewPanel";
import { listSheetLockedSpellRefs } from "@/lib/character/sheetPreparedSpells";
import { useContentLocale } from "@/store/useContentLocale";

type MagicTabProps = {
    stored: StoredCharacter;
};

export function MagicTab({ stored }: MagicTabProps) {
    const tMagic = useTranslations("playerSheet.magic");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const [prepareOpen, setPrepareOpen] = useState(false);

    const canPrepare = characterCanPrepareSpells(stored, contentLocale);
    const quota = computePreparedSpellQuotaForStored(stored);
    const locked = listSheetLockedSpellRefs(stored, contentLocale);
    const preparedCount = readPreparedSpells(stored.selections.choices).filter(
        (slug) => !locked.has(slug)
    ).length;

    const prepareButton = canPrepare ? (
        <Button type="button" onClick={() => setPrepareOpen(true)}>
            {quota !== undefined
                ? tMagic("prepareCtaWithCount", {
                      prepared: preparedCount,
                      quota,
                  })
                : tMagic("prepareCta")}
        </Button>
    ) : null;

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
            <div className="flex min-w-0 flex-col gap-4">
                <MagicSpellbookPanel
                    stored={stored}
                    emptyAction={prepareButton}
                />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
                <CastingStatsPanel stored={stored} />
                <SpellSlotsPanel stored={stored} />
                {canPrepare ? (
                    <OverviewPanel title={tMagic("preparePanelTitle")}>
                        <div className="flex flex-col items-start gap-2">
                            <p className="text-sm text-muted-foreground">
                                {tMagic("prepareHelp")}
                            </p>
                            {prepareButton}
                        </div>
                    </OverviewPanel>
                ) : null}
            </div>
            {canPrepare ? (
                <PrepareSpellsModal
                    stored={stored}
                    open={prepareOpen}
                    onOpenChange={setPrepareOpen}
                />
            ) : null}
        </div>
    );
}
