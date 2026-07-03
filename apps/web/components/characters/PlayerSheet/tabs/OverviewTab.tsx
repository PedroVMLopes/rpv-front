"use client";

import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { PortraitSection } from "../overview/PortraitSection";
import { AbilitiesSection } from "../overview/AbilitiesSection";
import { SkillsCard } from "../overview/SkillsCard";
import { ProficienciesCard } from "../overview/ProficienciesCard";
import { IdentitySection } from "../overview/IdentitySection";
import { ActionsSection } from "../overview/ActionsSection";

type OverviewTabProps = {
    stored: StoredCharacter;
};

export function OverviewTab({ stored }: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="flex flex-col gap-4">
                <PortraitSection stored={stored} />
                <AbilitiesSection stored={stored} />
                <ProficienciesCard stored={stored} />
            </div>

            <div className="flex flex-col gap-4">
                <SkillsCard stored={stored} />
                <IdentitySection stored={stored} />
            </div>

            <div className="flex flex-col gap-4">
                <ActionsSection stored={stored} />
            </div>
        </div>
    );
}
