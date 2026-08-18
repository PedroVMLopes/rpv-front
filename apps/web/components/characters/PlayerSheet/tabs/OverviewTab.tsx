"use client";

import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { UnresolvedChoicesBlock } from "@/components/characters/CharacterCard/CharacterCardRaceInfo";
import { PortraitSection } from "../overview/PortraitSection";
import { AbilitiesSection } from "../overview/AbilitiesSection";
import { CastingStatsPanel } from "../overview/CastingStatsPanel";
import { SkillsCard } from "../overview/SkillsCard";
import { ProficienciesCard } from "../overview/ProficienciesCard";
import { IdentitySummarySection } from "../overview/IdentitySection";
import { FeaturesTraitsSection } from "../overview/FeaturesTraitsSection";
import { ClassResourcesPanel } from "../combat/ClassResourcesPanel";

type OverviewTabProps = {
    stored: StoredCharacter;
};

export function OverviewTab({ stored }: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="flex flex-col gap-4">
                <PortraitSection stored={stored} />
                <AbilitiesSection stored={stored} />
                <CastingStatsPanel stored={stored} />
                <ClassResourcesPanel stored={stored} />
            </div>

            <div className="flex flex-col gap-4">
                <UnresolvedChoicesBlock stored={stored} panelVariant="nested" />
                <SkillsCard stored={stored} />
            </div>

            <div className="flex flex-col gap-4">
                <IdentitySummarySection stored={stored} />
                <ProficienciesCard stored={stored} />
                <FeaturesTraitsSection stored={stored} />
            </div>
        </div>
    );
}
