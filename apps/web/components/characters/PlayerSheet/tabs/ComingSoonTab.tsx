"use client";

import { useTranslations } from "next-intl";

export function ComingSoonTab() {
    const t = useTranslations("playerSheet");

    return (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed p-8">
            <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
        </div>
    );
}
