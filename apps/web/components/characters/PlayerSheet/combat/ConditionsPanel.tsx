"use client";

import { useTranslations } from "next-intl";
import { OverviewPanel } from "../overview/OverviewPanel";

export function ConditionsPanel() {
    const t = useTranslations("playerSheet");

    return (
        <OverviewPanel title={t("combat.conditionsImmunities")}>
            <p className="text-sm text-muted-foreground">{t("noneYet")}</p>
        </OverviewPanel>
    );
}
