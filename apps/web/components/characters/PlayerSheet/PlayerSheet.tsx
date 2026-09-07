"use client";

import { useEffect, useState } from "react";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { characterHasMagic } from "@/lib/character/characterHasMagic";
import { cn } from "@/lib/utils";
import { PlayerSheetHeader } from "./PlayerSheetHeader";
import type { PlayerSheetTabId } from "./PlayerSheetTabBar";
import { sheetSurface } from "./playerSheetSurfaces";
import { OverviewTab } from "./tabs/OverviewTab";
import { CombatTab } from "./tabs/CombatTab";
import { InventoryTab } from "./tabs/InventoryTab";
import { MagicTab } from "./tabs/MagicTab";
import { NotesTab } from "./tabs/NotesTab";
import { PlayerSheetActionBar } from "./PlayerSheetActionBar";
import { RollAssistantProvider } from "./roll/RollAssistantProvider";

type PlayerSheetProps = {
    stored: StoredCharacter;
};

export function PlayerSheet({ stored }: PlayerSheetProps) {
    const [activeTab, setActiveTab] = useState<PlayerSheetTabId>("overview");
    const showMagic = characterHasMagic(stored);

    useEffect(() => {
        if (!showMagic && activeTab === "magic") {
            setActiveTab("overview");
        }
    }, [showMagic, activeTab]);

    return (
        <RollAssistantProvider characterId={stored.id}>
            <div className="flex min-h-full flex-col">
                <PlayerSheetHeader
                    stored={stored}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    showMagic={showMagic}
                />
                <main
                    className={cn(
                        "flex-1 rounded-b-xl border border-t-0 border-border px-3 pt-3 pb-20 sm:px-4 sm:pt-4 sm:pb-20",
                        sheetSurface
                    )}
                    role="tabpanel"
                >
                    {activeTab === "overview" ? (
                        <OverviewTab stored={stored} />
                    ) : null}
                    {activeTab === "combat" ? (
                        <CombatTab stored={stored} />
                    ) : null}
                    {activeTab === "inventory" ? (
                        <InventoryTab stored={stored} />
                    ) : null}
                    {activeTab === "magic" && showMagic ? (
                        <MagicTab stored={stored} />
                    ) : null}
                    {activeTab === "notes" ? <NotesTab stored={stored} /> : null}
                </main>
                <PlayerSheetActionBar stored={stored} />
            </div>
        </RollAssistantProvider>
    );
}
