"use client";

import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeSwitcher from "@/components/layout/ThemeSwitcher";

export default function UserPage() {
    const t = useTranslations("user");

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>

            <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold">{t("preferences")}</h2>
                <div className="flex items-center gap-2">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
            </section>
        </div>
    );
}
