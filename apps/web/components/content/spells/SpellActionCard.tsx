"use client";

import { useMemo, useState } from "react";
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
import { useCharacterStore } from "@/store/useCharacterStore";
import {
    buildSpellContentModel,
    type SpellContentFormatters,
} from "@/lib/content/buildSpellContentModel";
import type {
    ContentDetailModel,
    ContentSummaryModel,
    ContentUseActionSpec,
} from "@/lib/content/contentDetail.types";
import { ContentActionCard } from "../ContentActionCard";
import { Button } from "@/components/ui/button";

type SpellActionCardProps = {
    stored: StoredCharacter;
    spell: SpellAction;
    spellcastingAbility?: StatKey | null;
    openRollRequest: (request: RollRequest) => void;
    hideShortDescription?: boolean;
    /** When false, card is read-only (known but unprepared). Defaults to true. */
    castable?: boolean;
};

function spellBaseLevel(
    spell: SpellAction,
    catalogLevel: number | undefined
): number {
    const fromCatalog = catalogEntryLevel(catalogLevel);
    if (fromCatalog !== undefined) {
        return fromCatalog;
    }

    return spell.levelInt && spell.levelInt > 0 ? spell.levelInt : 1;
}

function catalogEntryLevel(level: number | undefined): number | undefined {
    if (level === undefined || level < 1) {
        return undefined;
    }

    return level;
}

function withDisabledUseActions(
    model: ContentSummaryModel
): ContentSummaryModel {
    return {
        ...model,
        useAction: model.useAction
            ? { ...model.useAction, disabled: true }
            : undefined,
        useActions: model.useActions?.map((action) => ({
            ...action,
            disabled: true,
        })),
    };
}

function withDisabledDetailUse(
    model: ContentDetailModel
): ContentDetailModel {
    return {
        ...model,
        useAction: model.useAction
            ? { ...model.useAction, disabled: true }
            : undefined,
        useActions: model.useActions?.map((action) => ({
            ...action,
            disabled: true,
        })),
    };
}

export function SpellActionCard({
    stored,
    spell,
    spellcastingAbility,
    openRollRequest,
    hideShortDescription,
    castable = true,
}: SpellActionCardProps) {
    const tContentDetail = useTranslations("contentDetail");
    const tSpells = useTranslations("spells");
    const tAbilities = useTranslations("abilities");
    const tCombat = useTranslations("playerSheet.combat");
    const tMagic = useTranslations("playerSheet.magic");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const setCharacterSession = useCharacterStore(
        (state) => state.setCharacterSession
    );
    const concentratingOn = useCharacterStore(
        (state) =>
            state.characters.find((character) => character.id === stored.id)
                ?.session?.concentratingOn
    );

    const catalogEntry = contentRepo(stored.system).getSpell(
        spell.slug,
        contentLocale
    );
    const concentrating = concentratingOn?.slug === spell.slug;
    const baseLevel = spellBaseLevel(spell, catalogEntry?.levelInt);
    const persistedSlot = concentratingOn?.slotLevel;
    const [draftSlotLevel, setDraftSlotLevel] = useState(
        concentrating && persistedSlot !== undefined ? persistedSlot : baseLevel
    );
    const slotLevel = concentrating
        ? (persistedSlot ?? draftSlotLevel)
        : draftSlotLevel;
    const canUpcast =
        (catalogEntry?.levelInt ?? spell.levelInt ?? 0) > 0;

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

    const { summary, detail } = useMemo(() => {
        const models = buildSpellContentModel(
            {
                spell,
                catalogEntry,
                spellcastingAbility,
                concentrating,
            },
            formatters
        );

        if (castable) {
            return models;
        }

        const unpreparedBadge = {
            label: tMagic("unpreparedBadge"),
            variant: "muted" as const,
        };

        return {
            summary: withDisabledUseActions({
                ...models.summary,
                badges: [...models.summary.badges, unpreparedBadge],
            }),
            detail: withDisabledDetailUse(models.detail),
        };
    }, [
        castable,
        catalogEntry,
        concentrating,
        formatters,
        spell,
        spellcastingAbility,
        tMagic,
    ]);

    const setConcentration = (nextSlot: number | undefined) => {
        setCharacterSession(stored.id, {
            concentratingOn: {
                slug: spell.slug,
                ...(nextSlot !== undefined ? { slotLevel: nextSlot } : {}),
            },
        });
    };

    const clearConcentration = () => {
        setCharacterSession(stored.id, { concentratingOn: null });
    };

    const handleUse = (useAction: ContentUseActionSpec) => {
        if (!castable || useAction.disabled) {
            return;
        }

        if (useAction.kind === "cast") {
            const ritualLabel =
                useAction.role === "ritual" ? tCombat("castAsRitual") : null;
            toast(ritualLabel ? `${spell.name} (${ritualLabel})` : spell.name);

            if (catalogEntry?.requiresConcentration) {
                setConcentration(canUpcast ? slotLevel : undefined);
            }
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

    const handleSlotChange = (next: number) => {
        setDraftSlotLevel(next);
        if (concentrating) {
            setConcentration(next);
        }
    };

    const afterContent =
        castable && (catalogEntry?.requiresConcentration || canUpcast) ? (
            <div className="flex flex-col gap-2">
                {canUpcast ? (
                    <label className="flex items-center justify-between gap-2 text-sm">
                        <span>{tCombat("upcastSlot")}</span>
                        <select
                            className="rounded-md border bg-muted text-muted-foreground px-2 py-1 text-sm"
                            value={slotLevel}
                            onChange={(event) =>
                                handleSlotChange(Number(event.target.value))
                            }
                            aria-label={tCombat("upcastSlot")}
                        >
                            {Array.from(
                                { length: 10 - baseLevel },
                                (_, index) => baseLevel + index
                            ).map((level) => (
                                <option key={level} value={level}>
                                    {tCombat("slotLevel", { level })}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : null}
                {catalogEntry?.requiresConcentration ? (
                    concentrating ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearConcentration}
                        >
                            {tCombat("stopConcentrating")}
                        </Button>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            {tCombat("concentrationHint")}
                        </p>
                    )
                ) : null}
            </div>
        ) : null;

    const canUse =
        Boolean(summary.useActions?.length) || Boolean(summary.useAction);

    return (
        <ContentActionCard
            summary={summary}
            detail={detail}
            expandLabel={tContentDetail("expand", { title: spell.name })}
            onUse={canUse ? handleUse : undefined}
            hideShortDescription={hideShortDescription}
            afterContent={afterContent}
            className={castable ? undefined : "opacity-60"}
        />
    );
}
