"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
    canAdjustCombatResource,
    listCombatResources,
} from "@/lib/character/combatResources";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";

type ClassResourcesPanelProps = {
    stored: StoredCharacter;
};

export function ClassResourcesPanel({ stored }: ClassResourcesPanelProps) {
    const t = useTranslations("playerSheet");
    const tResources = useTranslations("classResources");
    const updateResource = useCharacterStore((state) => state.updateResource);

    const entries = useMemo(
        () => listCombatResources(stored.grants ?? [], stored.resources),
        [stored.grants, stored.resources]
    );

    if (entries.length === 0) {
        return null;
    }

    const adjust = (
        entry: (typeof entries)[number],
        delta: number
    ) => {
        if (!canAdjustCombatResource(entry, delta)) {
            return;
        }
        // Store treats missing keys as 0; panel treats missing as max.
        const storeCurrent = stored.resources[entry.ref] ?? 0;
        const next = entry.current + delta;
        const actualDelta = next - storeCurrent;
        if (actualDelta !== 0) {
            updateResource(stored.id, entry.ref, actualDelta);
        }
    };

    return (
        <section className="flex flex-col gap-3 rounded-2xl border p-3">
            <h2 className="text-sm font-bold">{t("combat.classResources")}</h2>
            <ul className="flex flex-col gap-2">
                {entries.map((entry) => {
                    const displayLabel =
                        entry.spellLevel !== undefined
                            ? t("spellLevel", { level: entry.spellLevel })
                            : formatResourceRefLabel(entry.ref, (key) =>
                                  tResources(key)
                              );

                    return (
                        <li
                            key={entry.ref}
                            className="flex items-center justify-between gap-2 rounded-xl border bg-popover px-3 py-2"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                    {displayLabel}
                                </p>
                                <p className="text-xs tabular-nums text-muted-foreground">
                                    {entry.current} / {entry.max}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    disabled={
                                        !canAdjustCombatResource(entry, -1)
                                    }
                                    aria-label={`${displayLabel} −`}
                                    onClick={() => adjust(entry, -1)}
                                >
                                    <FaMinus className="size-3" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    disabled={
                                        !canAdjustCombatResource(entry, 1)
                                    }
                                    aria-label={`${displayLabel} +`}
                                    onClick={() => adjust(entry, 1)}
                                >
                                    <FaPlus className="size-3" />
                                </Button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
