"use client";

import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { ActionStatusRail } from "../combat/ActionStatusRail";
import { AttacksActionsPanel } from "../combat/AttacksActionsPanel";
import { DefenseSavesPanel } from "../combat/DefenseSavesPanel";
import { ConditionsPanel } from "../combat/ConditionsPanel";

type CombatTabProps = {
    stored: StoredCharacter;
};

export function CombatTab({ stored }: CombatTabProps) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
            <div className="flex flex-col gap-4">
                <ActionStatusRail stored={stored} />
                <AttacksActionsPanel stored={stored} />
            </div>
            <div className="flex flex-col gap-4">
                <DefenseSavesPanel stored={stored} />
                <ConditionsPanel />
            </div>
        </div>
    );
}
