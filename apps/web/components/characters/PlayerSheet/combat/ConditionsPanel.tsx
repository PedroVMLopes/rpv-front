"use client";

import { useTranslations } from "next-intl";

export function ConditionsPanel() {
    const t = useTranslations("playerSheet");

    return (
        <section className="flex flex-col gap-2 rounded-2xl border p-3">
            <h2 className="text-sm font-bold">
                {t("combat.conditionsImmunities")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("noneYet")}</p>
        </section>
    );
}
