"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getItem } from "@rpv/content";
import type { WeaponAction } from "@/lib/character/combatActions";
import {
    buildWeaponAttackOnlyRollRequest,
    buildWeaponDamageRollRequest,
    isFlatOnlyDamageRequest,
    resolveFlatDamageTotal,
} from "@/lib/roll/buildRollRequest";
import type { RollRequest } from "@/lib/roll/rollRequest.types";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useContentLocale } from "@/store/useContentLocale";
import {
    buildWeaponContentModel,
    type WeaponContentFormatters,
} from "@/lib/content/buildWeaponContentModel";
import type { ContentUseActionSpec } from "@/lib/content/contentDetail.types";
import { ContentActionCard } from "../ContentActionCard";

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
    const tCombat = useTranslations("playerSheet.combat");
    const tRoll = useTranslations("playerSheet.roll");
    const contentLocale = useContentLocale((state) => state.contentLocale);

    const itemEntry =
        weapon.slotId === "natural"
            ? undefined
            : getItem(weapon.slug, stored.system, contentLocale);
    const slotLabel =
        weapon.slotId === "melee-main"
            ? tSlots("meleeMain")
            : weapon.slotId === "melee-off"
              ? tSlots("meleeOff")
              : weapon.slotId === "ranged-main"
                ? tSlots("rangedMain")
                : weapon.slotId === "ranged-off"
                  ? tSlots("rangedOff")
                  : tCombat("naturalWeapon");

    const formatters = useMemo<WeaponContentFormatters>(
        () => ({
            tItems: (key, values) => tItems(key, values),
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

        if (useAction.role === "damage") {
            const request = buildWeaponDamageRollRequest(weapon);
            if (!request) {
                return;
            }
            if (isFlatOnlyDamageRequest(request)) {
                toast(
                    tRoll("damageOnlyToast", {
                        label: request.label,
                        total: resolveFlatDamageTotal(request),
                    })
                );
                return;
            }
            openRollRequest(request);
            return;
        }

        const request = buildWeaponAttackOnlyRollRequest(weapon);
        if (request) {
            openRollRequest(request);
        }
    };

    const canUse =
        Boolean(summary.useActions?.length) || Boolean(summary.useAction);

    return (
        <ContentActionCard
            summary={summary}
            detail={detail}
            expandLabel={tContentDetail("expand", { title: weapon.name })}
            onUse={canUse ? handleUse : undefined}
        />
    );
}
