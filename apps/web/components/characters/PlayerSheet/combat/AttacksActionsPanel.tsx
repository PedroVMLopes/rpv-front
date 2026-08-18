"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
    buildDisplayActions,
    filterDisplayActions,
    groupDisplayActions,
    type ActionCost,
    type ActionFilterId,
    type DisplayAction,
} from "@/lib/character/actionDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    buildSpellAttackRollRequest,
    buildSpellDamageRollRequest,
    buildWeaponAttackRollRequest,
} from "@/lib/roll/buildRollRequest";
import { useContentLocale } from "@/store/useContentLocale";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CombatActionCard } from "./CombatActionCard";
import { OverviewPanel } from "../overview/OverviewPanel";
import { useRollAssistant } from "../roll/RollAssistantProvider";

type AttacksActionsPanelProps = {
    stored: StoredCharacter;
};

const FILTERS: ActionFilterId[] = [
    "all",
    "weapons",
    "spells",
    "features",
    "available",
];

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

function filterLabel(
    filter: ActionFilterId,
    t: ReturnType<typeof useTranslations>
) {
    switch (filter) {
        case "all":
            return t("combat.filters.all");
        case "weapons":
            return t("combat.filters.weapons");
        case "spells":
            return t("combat.filters.spells");
        case "features":
            return t("combat.filters.features");
        case "available":
            return t("combat.filters.available");
    }
}

function actionButtonLabel(action: DisplayAction) {
    return action.actionLabel;
}

export function AttacksActionsPanel({ stored }: AttacksActionsPanelProps) {
    const t = useTranslations("playerSheet");
    const tSlots = useTranslations("equipmentSlots");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const { openRollRequest } = useRollAssistant();
    const resolved = getResolvedStats(stored.id);
    const [activeFilter, setActiveFilter] = useState<ActionFilterId>("all");

    const actions = useMemo(() => {
        if (!resolved) {
            return [];
        }

        return buildDisplayActions(
            stored,
            resolved,
            contentLocale,
            (key) => tSlots(key)
        );
    }, [contentLocale, resolved, stored, tSlots]);

    const visibleActions = useMemo(
        () => filterDisplayActions(actions, activeFilter),
        [actions, activeFilter]
    );

    const groups = useMemo(
        () => groupDisplayActions(visibleActions),
        [visibleActions]
    );

    const hasAny = groups.length > 0;

    return (
        <OverviewPanel title={t("combat.attacksActions")}>
            {!hasAny ? (
                <p className="text-sm text-muted-foreground">
                    {t("combat.noActions")}
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    <div
                        className="flex flex-wrap gap-2"
                        role="tablist"
                        aria-label={t("combat.filtersLabel")}
                    >
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                role="tab"
                                aria-selected={activeFilter === filter}
                                className="rounded-full border px-3 py-1 text-xs font-semibold"
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filterLabel(filter, t)}
                            </button>
                        ))}
                    </div>

                    {groups.map((group) => (
                        <div key={group.cost} className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                                {groupTitle(group.cost, t)}
                            </p>
                            <ul className="flex flex-col gap-2">
                                {group.actions.map((action) => (
                                    <li key={action.id}>
                                        <CombatActionCard
                                            title={action.title}
                                            badges={action.badges}
                                            details={action.summary}
                                            description={action.description}
                                            actionKind={actionButtonLabel(action)}
                                            availability={action.availability}
                                            resourceLabel={
                                                action.resource
                                                    ? `${action.resource.label}${
                                                          action.resource.current !==
                                                              undefined &&
                                                          action.resource.max !==
                                                              undefined
                                                              ? ` ${action.resource.current}/${action.resource.max}`
                                                              : ""
                                                      }`
                                                    : undefined
                                            }
                                            stateTags={action.stateTags}
                                            onRoll={
                                                action.rollRequest
                                                    ? () =>
                                                          openRollRequest(
                                                              action.rollRequest!
                                                          )
                                                    : undefined
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </OverviewPanel>
    );
}
