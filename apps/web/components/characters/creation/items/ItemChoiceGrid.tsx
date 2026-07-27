"use client";

import { useMemo, useState } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { getItem } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { StartingEquipmentChoiceGrant } from "@/lib/character/deriveStartingEquipmentFromForm";
import { inventoryChoiceToPending } from "@/lib/character/deriveStartingEquipmentFromForm";
import { buildGrantChoiceSelectOptions } from "@/lib/character/grantChoiceOptions";
import { readGrantPicks, setGrantPick } from "@/lib/character/grantPickForm";
import {
    buildBundlePickContentModel,
    buildItemPickContentModel,
} from "@/lib/content/buildItemPickContentModel";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import { Button } from "@/components/ui/button";
import type { SystemKey } from "@/presets";
import { cn } from "@/lib/utils";

type ItemChoiceGridProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    choices: StartingEquipmentChoiceGrant[];
    invalidKeys?: Set<string>;
    focusKey?: string;
};

export function ItemChoiceGrid({
    form,
    contentLocale,
    system,
    choices,
    invalidKeys = new Set(),
    focusKey,
}: ItemChoiceGridProps) {
    const t = useTranslations("characterCreation");
    const tItems = useTranslations("items");
    const tSlots = useTranslations("equipmentSlots");
    const grantPicks = readGrantPicks(form);
    const [detailModel, setDetailModel] = useState<ContentDetailModel | null>(
        null
    );

    const formatters = useMemo(
        () => ({
            tItems: (key: string, values?: Record<string, string | number>) =>
                tItems(key as never, values as never),
            tContentDetail: () => "",
            missingValue: "—",
            slotLabel: (slotId: string) => {
                const keyMap: Record<string, string> = {
                    armor: "armor",
                    "main-hand": "mainHand",
                    "off-hand": "offHand",
                    neck: "neck",
                    ring: "ring",
                };
                const msgKey = keyMap[slotId];
                return msgKey ? tSlots(msgKey as never) : slotId;
            },
        }),
        [tItems, tSlots]
    );

    function openOptionDetail(
        choice: StartingEquipmentChoiceGrant,
        optionIndex: number
    ) {
        const option = choice.grant.options?.[optionIndex];
        if (!option) {
            return;
        }

        if (option.optionType === "item") {
            const item = getItem(option.ref, system, contentLocale);
            if (!item) {
                return;
            }
            setDetailModel(buildItemPickContentModel(item, formatters).detail);
            return;
        }

        if (option.optionType === "inventory_bundle") {
            setDetailModel(
                buildBundlePickContentModel(
                    {
                        option,
                        optionIndex,
                        system,
                        locale: contentLocale,
                    },
                    formatters
                ).detail
            );
        }
    }

    function optionBadges(
        choice: StartingEquipmentChoiceGrant,
        optionIndex: number
    ): string[] {
        const option = choice.grant.options?.[optionIndex];
        if (!option) {
            return [];
        }

        if (option.optionType === "item") {
            const item = getItem(option.ref, system, contentLocale);
            if (!item) {
                return [];
            }
            return buildItemPickContentModel(item, formatters).summary.badges.map(
                (badge) => badge.label
            );
        }

        if (option.optionType === "inventory_bundle") {
            return buildBundlePickContentModel(
                {
                    option,
                    optionIndex,
                    system,
                    locale: contentLocale,
                },
                formatters
            ).summary.badges.map((badge) => badge.label);
        }

        return [];
    }

    return (
        <div className="flex flex-col gap-6">
            {choices.map((choice) => {
                const pending = inventoryChoiceToPending(
                    choice,
                    system,
                    contentLocale
                );
                const options = buildGrantChoiceSelectOptions(
                    pending,
                    grantPicks,
                    new Set<string>()
                );
                const selected = grantPicks[choice.key] ?? "";
                const hasError = invalidKeys.has(choice.key);
                const isFocused = focusKey === choice.key;

                return (
                    <section
                        key={choice.key}
                        data-focus-key={choice.key}
                        data-testid={`item-choice-${choice.key}`}
                        className={cn(
                            "flex flex-col gap-3 rounded-lg",
                            hasError && "ring-1 ring-destructive",
                            isFocused && "ring-2 ring-primary ring-offset-2"
                        )}
                    >
                        <h3 className="text-sm font-bold">{choice.label}</h3>
                        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                            {options.map((option) => {
                                const isSelected = option.value === selected;
                                const badges = optionBadges(
                                    choice,
                                    Number.parseInt(option.value, 10)
                                );

                                return (
                                    <div
                                        key={`${choice.key}-${option.value}`}
                                        data-testid={`item-option-${choice.key}-${option.value}`}
                                        className={cn(
                                            "flex flex-col gap-2 rounded-xl border-custom bg-popover text-popover-foreground p-3 transition-colors",
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "",
                                            option.disabled &&
                                                !isSelected &&
                                                "opacity-50"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <button
                                                type="button"
                                                disabled={
                                                    option.disabled && !isSelected
                                                }
                                                className="min-w-0 flex-1 text-left"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setGrantPick(
                                                            form,
                                                            choice.key,
                                                            ""
                                                        );
                                                        return;
                                                    }

                                                    if (option.disabled) {
                                                        return;
                                                    }

                                                    setGrantPick(
                                                        form,
                                                        choice.key,
                                                        option.value
                                                    );
                                                }}
                                            >
                                                <span className="font-serif font-semibold leading-tight">
                                                    {option.label}
                                                </span>
                                                {badges.length > 0 ? (
                                                    <span className="mt-1 block text-xs">
                                                        {badges.join(" · ")}
                                                    </span>
                                                ) : null}
                                            </button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="size-8 shrink-0"
                                                aria-label={t(
                                                    "selection.expandDetails"
                                                )}
                                                onClick={() =>
                                                    openOptionDetail(
                                                        choice,
                                                        Number.parseInt(
                                                            option.value,
                                                            10
                                                        )
                                                    )
                                                }
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
                    </section>
                );
            })}

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
