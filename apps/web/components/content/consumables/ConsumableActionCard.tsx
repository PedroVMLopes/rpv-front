"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { StatKey } from "@rpv/domain";
import type { DisplayAction } from "@/lib/character/actionDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { performConsumableUse } from "@/lib/character/useConsumable";
import {
    buildSpellContentModel,
    type SpellContentFormatters,
} from "@/lib/content/buildSpellContentModel";
import type { ContentUseActionSpec } from "@/lib/content/contentDetail.types";
import { contentRepo } from "@/lib/content/contentRepository";
import { ContentActionCard } from "@/components/content/ContentActionCard";
import type { RollRequest } from "@/lib/roll/rollRequest.types";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";

type ConsumableActionCardProps = {
    stored: StoredCharacter;
    action: DisplayAction;
    spellcastingAbility?: StatKey | null;
    openRollRequest: (request: RollRequest) => void;
    hideShortDescription?: boolean;
};

export function ConsumableActionCard({
    stored,
    action,
    spellcastingAbility,
    openRollRequest,
    hideShortDescription,
}: ConsumableActionCardProps) {
    const tContentDetail = useTranslations("contentDetail");
    const tSpells = useTranslations("spells");
    const tAbilities = useTranslations("abilities");
    const tCombat = useTranslations("playerSheet.combat");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const useInventoryItem = useCharacterStore(
        (state) => state.useInventoryItem
    );
    const setCharacterSession = useCharacterStore(
        (state) => state.setCharacterSession
    );

    const consumable = action.consumable;
    const spell = action.spell;

    const formatters = useMemo<SpellContentFormatters>(
        () => ({
            tSpells: (key, values) => tSpells(key, values),
            tAbilities: (key) => tAbilities(key),
            tContentDetail: (key) => tContentDetail(key),
            tUse: () => tCombat("use"),
            tRitual: () => tCombat("castAsRitual"),
            missingValue: "—",
        }),
        [tAbilities, tCombat, tContentDetail, tSpells]
    );

    const catalogEntry = spell
        ? contentRepo(stored.system).getSpell(spell.slug, contentLocale)
        : undefined;

    const { summary, detail } = useMemo(() => {
        if (!spell) {
            return {
                summary: {
                    id: action.id,
                    kind: "item" as const,
                    title: action.title,
                    badges: action.badges.map((label) => ({
                        label,
                        variant: "muted" as const,
                    })),
                    useAction:
                        action.availability === "depleted"
                            ? {
                                  kind: "cast" as const,
                                  label: tCombat("use"),
                                  disabled: true,
                              }
                            : {
                                  kind: "cast" as const,
                                  label: tCombat("use"),
                              },
                },
                detail: {
                    id: action.id,
                    kind: "item" as const,
                    title: action.title,
                    sections: [],
                    description: action.description,
                },
            };
        }

        const models = buildSpellContentModel(
            {
                spell,
                catalogEntry,
                spellcastingAbility,
            },
            formatters
        );

        const depleted = action.availability === "depleted";
        const qtyBadge = {
            label: `${consumable?.quantity ?? 0}`,
            variant: "muted" as const,
        };

        const markDisabled = (
            useAction: ContentUseActionSpec | undefined
        ): ContentUseActionSpec | undefined => {
            if (!useAction) {
                return undefined;
            }
            return depleted ? { ...useAction, disabled: true } : useAction;
        };

        const useActions = models.summary.useActions?.map((entry) =>
            depleted ? { ...entry, disabled: true } : entry
        );

        return {
            summary: {
                ...models.summary,
                title: action.title,
                badges: [...models.summary.badges, qtyBadge],
                useAction: markDisabled(models.summary.useAction),
                useActions,
            },
            detail: {
                ...models.detail,
                title: action.title,
                useAction: markDisabled(models.detail.useAction),
                useActions,
            },
        };
    }, [
        action.availability,
        action.badges,
        action.description,
        action.id,
        action.title,
        catalogEntry,
        consumable?.quantity,
        formatters,
        spell,
        spellcastingAbility,
        tCombat,
    ]);

    const handleUse = (useAction: ContentUseActionSpec) => {
        if (!consumable) {
            return;
        }

        const allUseActions =
            summary.useActions ??
            (summary.useAction ? [summary.useAction] : []);

        performConsumableUse({
            action: consumable,
            useAction,
            allUseActions,
            system: stored.system,
            locale: contentLocale,
            openRollRequest,
            consume: (slug, quantity) =>
                useInventoryItem(stored.id, slug, quantity),
            setConcentration: (payload) =>
                setCharacterSession(stored.id, {
                    concentratingOn: payload,
                }),
            castLabel:
                useAction.role === "ritual" ? tCombat("castAsRitual") : undefined,
        });
    };

    const canUse = Boolean(
        summary.useActions?.length || summary.useAction
    );

    return (
        <ContentActionCard
            summary={summary}
            detail={detail}
            expandLabel={tContentDetail("expand", { title: summary.title })}
            onUse={canUse ? handleUse : undefined}
            hideShortDescription={hideShortDescription}
        />
    );
}
