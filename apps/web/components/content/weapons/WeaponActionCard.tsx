"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getItem } from "@rpv/content";
import type { WeaponAction } from "@/lib/character/combatActions";
import { buildWeaponAttackRollRequest } from "@/lib/roll/buildRollRequest";
import type { RollRequest } from "@/lib/roll/rollRequest.types";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useContentLocale } from "@/store/useContentLocale";
import {
    buildWeaponContentModel,
    type WeaponContentFormatters,
} from "@/lib/content/buildWeaponContentModel";
import type { ContentUseActionSpec } from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "../ContentDetailModal";
import { ContentSummaryCard } from "../ContentSummaryCard";

type WeaponActionCardProps = {
    stored: StoredCharacter;
    weapon: WeaponAction;
    openRollRequest: (request: RollRequest) => void;
};

export function WeaponActionCard({
    stored,
    weapon,
    openRollRequest,
}: WeaponActionCardProps) {
    const tContentDetail = useTranslations("contentDetail");
    const tItems = useTranslations("items");
    const tSlots = useTranslations("equipmentSlots");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const [detailOpen, setDetailOpen] = useState(false);

    const itemEntry = getItem(weapon.slug, stored.system, contentLocale);
    const slotLabel =
        weapon.slotId === "main-hand"
            ? tSlots("mainHand")
            : tSlots("offHand");

    const formatters = useMemo<WeaponContentFormatters>(
        () => ({
            tItems: (key) => tItems(key),
            missingValue: "—",
        }),
        [tItems]
    );

    const { summary, detail } = useMemo(
        () =>
            buildWeaponContentModel(
                { weapon, itemEntry, slotLabel },
                formatters
            ),
        [formatters, itemEntry, slotLabel, weapon]
    );

    const handleUse = (useAction: ContentUseActionSpec) => {
        if (useAction.kind !== "roll") {
            return;
        }

        const request = buildWeaponAttackRollRequest(weapon);
        if (request) {
            openRollRequest(request);
        }
    };

    return (
        <>
            <ContentSummaryCard
                model={summary}
                expandLabel={tContentDetail("expand", { title: weapon.name })}
                onExpand={() => setDetailOpen(true)}
                onUse={summary.useAction ? handleUse : undefined}
            />
            <ContentDetailModal
                model={detail}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUse={detail.useAction ? handleUse : undefined}
            />
        </>
    );
}
