"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    hasAnyDamageAffinity,
    listDamageAffinitiesForCharacter,
} from "@/lib/character/damageAffinityDisplay";
import { useContentLocale } from "@/store/useContentLocale";
import { OverviewPanel } from "../overview/OverviewPanel";

type DamageAffinityPanelProps = {
    stored: StoredCharacter;
};

function AffinityList({
    title,
    types,
    labelFor,
}: {
    title: string;
    types: string[];
    labelFor: (type: string) => string;
}) {
    if (types.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
                {title}
            </p>
            <ul className="flex flex-wrap gap-1.5">
                {types.map((type) => (
                    <li
                        key={type}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                    >
                        {labelFor(type)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function DamageAffinityPanel({ stored }: DamageAffinityPanelProps) {
    const t = useTranslations("playerSheet.combat");
    const contentLocale = useContentLocale((state) => state.contentLocale);

    const affinity = useMemo(
        () =>
            listDamageAffinitiesForCharacter(
                stored.selections,
                stored.grants,
                contentLocale
            ),
        [stored.selections, stored.grants, contentLocale]
    );

    const labelFor = (type: string) => {
        const known: Record<string, string> = {
            fire: t("damageTypes.fire"),
            poison: t("damageTypes.poison"),
            cold: t("damageTypes.cold"),
            lightning: t("damageTypes.lightning"),
            acid: t("damageTypes.acid"),
            necrotic: t("damageTypes.necrotic"),
            radiant: t("damageTypes.radiant"),
            psychic: t("damageTypes.psychic"),
            force: t("damageTypes.force"),
            thunder: t("damageTypes.thunder"),
            bludgeoning: t("damageTypes.bludgeoning"),
            piercing: t("damageTypes.piercing"),
            slashing: t("damageTypes.slashing"),
        };
        return known[type] ?? type;
    };

    return (
        <OverviewPanel title={t("damageAffinities")}>
            {!hasAnyDamageAffinity(affinity) ? (
                <p className="text-sm text-muted-foreground">{t("noAffinities")}</p>
            ) : (
                <div className="flex flex-col gap-3">
                    <AffinityList
                        title={t("resistances")}
                        types={affinity.resistance}
                        labelFor={labelFor}
                    />
                    <AffinityList
                        title={t("immunities")}
                        types={affinity.immunity}
                        labelFor={labelFor}
                    />
                    <AffinityList
                        title={t("vulnerabilities")}
                        types={affinity.vulnerability}
                        labelFor={labelFor}
                    />
                </div>
            )}
        </OverviewPanel>
    );
}
