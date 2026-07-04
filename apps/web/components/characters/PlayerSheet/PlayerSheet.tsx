"use client";

import { useState } from "react";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { PlayerSheetHeader } from "./PlayerSheetHeader";
import type { PlayerSheetTabId } from "./PlayerSheetTabBar";
import { OverviewTab } from "./tabs/OverviewTab";
import { CombatTab } from "./tabs/CombatTab";
import { InventoryTab } from "./tabs/InventoryTab";
import { NotesTab } from "./tabs/NotesTab";

type PlayerSheetProps = {
    stored: StoredCharacter;
};

export function PlayerSheet({ stored }: PlayerSheetProps) {
    const [activeTab, setActiveTab] = useState<PlayerSheetTabId>("overview");

    return (
        <div className="flex min-h-full flex-col">
            <PlayerSheetHeader
                stored={stored}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <main className="flex-1 p-3 sm:p-4" role="tabpanel">
                {activeTab === "overview" ? (
                    <OverviewTab stored={stored} />
                ) : null}
                {activeTab === "combat" ? (
                    <CombatTab stored={stored} />
                ) : null}
                {activeTab === "inventory" ? <InventoryTab /> : null}
                {activeTab === "notes" ? <NotesTab /> : null}
            </main>
        </div>
    );
}
