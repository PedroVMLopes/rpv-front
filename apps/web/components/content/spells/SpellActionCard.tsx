"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { StatKey } from "@rpv/domain";
import { contentRepo } from "@/lib/content/contentRepository";
import type { SpellAction } from "@/lib/character/combatActions";
import {
    buildSpellAttackRollRequest,
    buildSpellDamageRollRequest,
} from "@/lib/roll/buildRollRequest";
import type { RollRequest } from "@/lib/roll/rollRequest.types";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useContentLocale } from "@/store/useContentLocale";
import {
    buildSpellContentModel,
    type SpellContentFormatters,
} from "@/lib/content/buildSpellContentModel";
import type { ContentUseActionSpec } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "../ContentDetailModal";
import { ContentSummaryCard } from "../ContentSummaryCard";

type SpellActionCardProps = {
    stored: StoredCharacter;
    spell: SpellAction;
    spellcastingAbility?: StatKey | null;
    openRollRequest: (request: RollRequest) => void;
};

function openSpellRoll(
    spell: SpellAction,
    openRollRequest: SpellActionCardProps["openRollRequest"]
) {
    const request =
        spell.rollProfile?.mode === "attack"
            ? buildSpellAttackRollRequest(spell)
            : spell.rollProfile?.mode === "save" ||
                spell.rollProfile?.mode === "damage_only"
              ? buildSpellDamageRollRequest(spell)
              : null;

    if (request) {
        openRollRequest(request);
    }
}

export function SpellActionCard({
    stored,
    spell,
    spellcastingAbility,
    openRollRequest,
}: SpellActionCardProps) {
    const tContentDetail = useTranslations("contentDetail");
    const tSpells = useTranslations("spells");
    const tAbilities = useTranslations("abilities");
    const tCombat = useTranslations("playerSheet.combat");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const [detailOpen, setDetailOpen] = useState(false);

    const catalogEntry = contentRepo(stored.system).getSpell(
        spell.slug,
        contentLocale
    );

    const formatters = useMemo<SpellContentFormatters>(
        () => ({
            tSpells: (key, values) => tSpells(key, values),
            tAbilities: (key) => tAbilities(key),
            tContentDetail: (key) => tContentDetail(key),
            tUse: () => tCombat("use"),
            missingValue: "—",
        }),
        [tAbilities, tCombat, tContentDetail, tSpells]
    );

    const { summary, detail } = useMemo(
        () =>
            buildSpellContentModel(
                { spell, catalogEntry, spellcastingAbility },
                formatters
            ),
        [catalogEntry, formatters, spell, spellcastingAbility]
    );

    const handleUse = (useAction: ContentUseActionSpec) => {
        if (useAction.kind === "roll") {
            openSpellRoll(spell, openRollRequest);
            return;
        }

        toast(`${spell.name}`);
    };

    return (
        <>
            <ContentSummaryCard
                model={summary}
                expandLabel={tContentDetail("expand", { title: spell.name })}
                onExpand={() => setDetailOpen(true)}
                onUse={summary.useAction ? handleUse : undefined}
            />
            <ContentDetailModal
                model={detail}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUse={detail.useAction ? handleUse : undefined}
            />
        </>
    );
}
