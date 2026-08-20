"use client";

import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { AttacksActionsPanel } from "../combat/AttacksActionsPanel";
import { CastingStatsPanel } from "../combat/CastingStatsPanel";
import { ClassResourcesPanel } from "../combat/ClassResourcesPanel";
import { DefenseSavesPanel } from "../combat/DefenseSavesPanel";
import { ConditionsPanel } from "../combat/ConditionsPanel";
import { CombatRemindersPanel } from "../combat/CombatRemindersPanel";

type CombatTabProps = {
    stored: StoredCharacter;
};

export function CombatTab({ stored }: CombatTabProps) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
            <div className="flex min-w-0 flex-col gap-4">
                <AttacksActionsPanel stored={stored} />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
                <CastingStatsPanel stored={stored} />
                <ClassResourcesPanel stored={stored} />
                <DefenseSavesPanel stored={stored} />
                <ConditionsPanel />
                <CombatRemindersPanel stored={stored} />
            </div>
        </div>
    );
}
