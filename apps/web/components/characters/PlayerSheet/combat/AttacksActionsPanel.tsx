"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ModifierSourceType, StatKey } from "@rpv/domain";
import {
    buildDisplayActions,
    filterDisplayActions,
    groupDisplayActions,
    type ActionCost,
    type ActionFilterId,
    type DisplayAction,
} from "@/lib/character/actionDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { contentRepo } from "@/lib/content/contentRepository";
import { FeatureActionCard } from "@/components/content/features/FeatureActionCard";
import { SpellActionCard } from "@/components/content/spells/SpellActionCard";
import { WeaponActionCard } from "@/components/content/weapons/WeaponActionCard";
import { useContentLocale } from "@/store/useContentLocale";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CombatActionFilter } from "./CombatActionFilter";
import { OverviewPanel } from "../overview/OverviewPanel";
import { useRollAssistant } from "../roll/RollAssistantProvider";

type AttacksActionsPanelProps = {
    stored: StoredCharacter;
};

function groupTitle(cost: ActionCost, t: ReturnType<typeof useTranslations>) {
    switch (cost) {
        case "action":
            return t("combat.group.action");
        case "bonus":
            return t("combat.group.bonus");
        case "reaction":
            return t("combat.group.reaction");
        case "special":
            return t("combat.group.special");
        case "passive":
            return t("combat.group.passive");
    }
}

function traitSourceLabel(
    sourceType: ModifierSourceType | undefined,
    t: ReturnType<typeof useTranslations>
): string {
    switch (sourceType) {
        case "race":
            return t("traitSource.race");
        case "class":
            return t("traitSource.class");
        case "subclass":
            return t("traitSource.subclass");
        case "background":
            return t("traitSource.background");
        case "item":
            return t("traitSource.item");
        case "feat":
            return t("traitSource.feat");
        case "spell":
            return t("traitSource.spell");
        case "condition":
            return t("traitSource.condition");
        case "system":
        default:
            return t("traitSource.system");
    }
}

function CombatActionEntry({
    stored,
    action,
    costLabel,
    spellcastingAbility,
    sourceLabel,
    openRollRequest,
}: {
    stored: StoredCharacter;
    action: DisplayAction;
    costLabel: string;
    spellcastingAbility: StatKey | null;
    sourceLabel: string;
    openRollRequest: ReturnType<typeof useRollAssistant>["openRollRequest"];
}) {
    if (action.sourceType === "weapon" && action.weapon) {
        return (
            <WeaponActionCard
                stored={stored}
                weapon={action.weapon}
                openRollRequest={openRollRequest}
            />
        );
    }

    if (action.sourceType === "spell" && action.spell) {
        return (
            <SpellActionCard
                stored={stored}
                spell={action.spell}
                spellcastingAbility={spellcastingAbility}
                openRollRequest={openRollRequest}
            />
        );
    }

    return (
        <FeatureActionCard
            action={action}
            costLabel={costLabel}
            sourceLabel={sourceLabel}
        />
    );
}

export function AttacksActionsPanel({ stored }: AttacksActionsPanelProps) {
    const t = useTranslations("playerSheet");
    const tSlots = useTranslations("equipmentSlots");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const { openRollRequest } = useRollAssistant();
    const resolved = getResolvedStats(stored.id);
    const [activeFilter, setActiveFilter] = useState<ActionFilterId>("all");

    const classEntry = stored.selections.characterClass
        ? contentRepo(stored.system).getClass(
              stored.selections.characterClass,
              contentLocale
          )
        : undefined;
    const spellcastingAbility = classEntry?.spellcastingAbility ?? null;

    const actions = useMemo(() => {
        if (!resolved) {
            return [];
        }

        return buildDisplayActions(
            stored,
            resolved,
            contentLocale,
            (key) => tSlots(key),
            t("combat.naturalWeapon")
        );
    }, [contentLocale, resolved, stored, t, tSlots]);

    const visibleActions = useMemo(
        () => filterDisplayActions(actions, activeFilter),
        [actions, activeFilter]
    );

    const groups = useMemo(
        () => groupDisplayActions(visibleActions),
        [visibleActions]
    );

    const hasCatalog = actions.length > 0;

    return (
        <OverviewPanel title={t("combat.attacksActions")}>
            {!hasCatalog ? (
                <p className="text-sm text-muted-foreground">
                    {t("combat.noActions")}
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    <CombatActionFilter
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />

                    {groups.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t("combat.noActions")}
                        </p>
                    ) : (
                        groups.map((group) => {
                            const costLabel = groupTitle(group.cost, t);

                            return (
                                <div
                                    key={group.cost}
                                    className="flex flex-col gap-2"
                                >
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                                        {costLabel}
                                    </p>
                                    <ul className="flex flex-col lg:grid lg:grid-cols-2 gap-2">
                                        {group.actions.map((action) => (
                                            <li
                                                key={action.id}
                                                className="min-w-0"
                                            >
                                                <CombatActionEntry
                                                    stored={stored}
                                                    action={action}
                                                    costLabel={costLabel}
                                                    spellcastingAbility={
                                                        spellcastingAbility
                                                    }
                                                    sourceLabel={traitSourceLabel(
                                                        action.featureSource,
                                                        t
                                                    )}
                                                    openRollRequest={
                                                        openRollRequest
                                                    }
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </OverviewPanel>
    );
}
