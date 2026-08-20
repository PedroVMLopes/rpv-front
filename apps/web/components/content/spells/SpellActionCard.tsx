"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { StatKey } from "@rpv/domain";
import { contentRepo } from "@/lib/content/contentRepository";
import type { SpellAction } from "@/lib/character/combatActions";
import {
    buildSpellAttackOnlyRollRequest,
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
import { ContentActionCard } from "../ContentActionCard";

type SpellActionCardProps = {
    stored: StoredCharacter;
    spell: SpellAction;
    spellcastingAbility?: StatKey | null;
    openRollRequest: (request: RollRequest) => void;
    hideShortDescription?: boolean;
};

export function SpellActionCard({
    stored,
    spell,
    spellcastingAbility,
    openRollRequest,
    hideShortDescription,
}: SpellActionCardProps) {
    const tContentDetail = useTranslations("contentDetail");
    const tSpells = useTranslations("spells");
    const tAbilities = useTranslations("abilities");
    const tCombat = useTranslations("playerSheet.combat");
    const contentLocale = useContentLocale((state) => state.contentLocale);

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
        if (useAction.kind === "cast") {
            toast(`${spell.name}`);
            return;
        }

        if (useAction.kind !== "roll") {
            return;
        }

        if (useAction.role === "attack") {
            const request = buildSpellAttackOnlyRollRequest(spell);
            if (request) {
                openRollRequest(request);
            }
            return;
        }

        const request = buildSpellDamageRollRequest(spell);
        if (request) {
            openRollRequest(request);
        }
    };

    const canUse =
        Boolean(summary.useActions?.length) || Boolean(summary.useAction);

    return (
        <ContentActionCard
            summary={summary}
            detail={detail}
            expandLabel={tContentDetail("expand", { title: spell.name })}
            onUse={canUse ? handleUse : undefined}
            hideShortDescription={hideShortDescription}
        />
    );
}
