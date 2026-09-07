"use client";

import { useMemo, useState } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { getSpell } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import { buildSpellPickContentModel } from "@/lib/content/buildSpellPickContentModel";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PreparedSpellPickerProps = {
    pool: readonly string[];
    prepared: readonly string[];
    locked: ReadonlySet<string>;
    quota: number;
    contentLocale: Locale;
    onToggle: (slug: string) => void;
    countLabel: string;
    emptyLabel: string;
    expandDetailsLabel: string;
};

export function PreparedSpellPicker({
    pool,
    prepared,
    locked,
    quota,
    contentLocale,
    onToggle,
    countLabel,
    emptyLabel,
    expandDetailsLabel,
}: PreparedSpellPickerProps) {
    const tSpells = useTranslations("spells");
    const tAbilities = useTranslations("abilities");
    const tContentDetail = useTranslations("contentDetail");

    const preparedSet = useMemo(() => new Set(prepared), [prepared]);

    const spellCards = useMemo(() => {
        return pool.map((slug) => {
            const catalogEntry = getSpell(slug, contentLocale);

            return {
                slug,
                name: catalogEntry?.name ?? slug,
                shortDescription:
                    catalogEntry?.shortDescription.trim() || undefined,
                catalogEntry,
            };
        });
    }, [pool, contentLocale]);

    const [detailModel, setDetailModel] = useState<ContentDetailModel | null>(
        null
    );

    const playerPrepared = prepared.filter((slug) => !locked.has(slug));
    const poolFull = playerPrepared.length >= quota;

    function openSpellDetail(spellRef: string) {
        const catalogEntry = getSpell(spellRef, contentLocale);

        if (!catalogEntry) {
            return;
        }

        const { detail } = buildSpellPickContentModel(catalogEntry, {
            tSpells: (key, values) => tSpells(key as never, values as never),
            tAbilities: (key) => tAbilities(key),
            tContentDetail: (key) => tContentDetail(key as never),
            tUse: () => tContentDetail("use"),
            tRitual: () => tContentDetail("fields.ritual"),
            missingValue: "—",
        });

        setDetailModel(detail);
    }

    if (spellCards.length === 0) {
        return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{countLabel}</p>
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {spellCards.map((spell) => {
                    const isLocked = locked.has(spell.slug);
                    const isSelected = isLocked || preparedSet.has(spell.slug);
                    const selectDisabled =
                        isLocked || (poolFull && !isSelected);

                    return (
                        <div
                            key={spell.slug}
                            className={cn(
                                "flex flex-col gap-2 rounded-xl border-3 p-3 transition-colors",
                                isSelected
                                    ? "border-primary border-2 ring-1 ring-primary/20 bg-card text-card-foreground"
                                    : "border-border bg-accent text-accent-foreground",
                                selectDisabled && "opacity-60"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <button
                                    type="button"
                                    className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
                                    aria-pressed={isSelected}
                                    disabled={selectDisabled}
                                    onClick={() => onToggle(spell.slug)}
                                >
                                    <span className="font-serif font-semibold leading-tight">
                                        {spell.name}
                                    </span>
                                    {spell.shortDescription ? (
                                        <span className="mt-1 block text-xs leading-snug opacity-80">
                                            {spell.shortDescription}
                                        </span>
                                    ) : null}
                                </button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="size-8 shrink-0"
                                    aria-label={expandDetailsLabel}
                                    onClick={() => openSpellDetail(spell.slug)}
                                >
                                    <Maximize2
                                        className="size-4"
                                        aria-hidden
                                    />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {detailModel ? (
                <ContentDetailModal
                    model={detailModel}
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setDetailModel(null);
                        }
                    }}
                />
            ) : null}
        </div>
    );
}
