"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { DisplayAction } from "@/lib/character/actionDisplay";
import { buildFeatureContentModel } from "@/lib/content/buildFeatureContentModel";
import type { ContentUseActionSpec } from "@/lib/content/contentDetail.types";
import { ContentActionCard } from "@/components/content/ContentActionCard";

type FeatureActionCardProps = {
    action: DisplayAction;
    costLabel?: string;
    sourceLabel: string;
};

export function FeatureActionCard({
    action,
    costLabel,
    sourceLabel,
}: FeatureActionCardProps) {
    const tContentDetail = useTranslations("contentDetail");
    const tCombat = useTranslations("playerSheet.combat");

    const isPassive = action.actionCost === "passive";
    const { summary, detail } = useMemo(
        () =>
            buildFeatureContentModel({
                id: action.id,
                title: action.title,
                description: action.description,
                sourceLabel,
                costLabel,
                useLabel: isPassive ? undefined : tCombat("use"),
                depleted: action.availability === "depleted",
            }),
        [
            action.availability,
            action.description,
            action.id,
            action.title,
            costLabel,
            isPassive,
            sourceLabel,
            tCombat,
        ]
    );

    const handleUse = (useAction: ContentUseActionSpec) => {
        if (useAction.kind !== "cast") {
            return;
        }
        toast(action.title);
    };

    return (
        <ContentActionCard
            summary={summary}
            detail={detail}
            expandLabel={tContentDetail("expand", { title: action.title })}
            onUse={handleUse}
        />
    );
}
