"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@rpv/domain";
import { setUserLocale } from "@/i18n/locale";
import { useContentLocale } from "@/store/useContentLocale";

const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    "pt-BR": "Português (BR)",
};

const selectClassName =
    "h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function LanguageSwitcher() {
    const t = useTranslations("common");
    const router = useRouter();
    const uiLocale = useLocale();
    const [isPending, startTransition] = useTransition();
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const setContentLocale = useContentLocale((state) => state.setContentLocale);

    const onUiLocaleChange = (value: string) => {
        if (!isLocale(value)) return;
        startTransition(async () => {
            await setUserLocale(value);
            router.refresh();
        });
    };

    const onContentLocaleChange = (value: string) => {
        if (!isLocale(value)) return;
        setContentLocale(value);
    };

    return (
        <div className="flex flex-row items-center gap-3 text-xs text-muted-foreground">
            <label className="flex items-center gap-1">
                <span className="hidden sm:inline">{t("uiLanguage")}</span>
                <select
                    aria-label={t("uiLanguage")}
                    className={selectClassName}
                    value={uiLocale}
                    disabled={isPending}
                    onChange={(event) => onUiLocaleChange(event.target.value)}
                >
                    {LOCALES.map((locale) => (
                        <option key={locale} value={locale}>
                            {LOCALE_LABELS[locale]}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex items-center gap-1">
                <span className="hidden sm:inline">{t("contentLanguage")}</span>
                <select
                    aria-label={t("contentLanguage")}
                    className={selectClassName}
                    value={contentLocale}
                    onChange={(event) => onContentLocaleChange(event.target.value)}
                >
                    {LOCALES.map((locale) => (
                        <option key={locale} value={locale}>
                            {LOCALE_LABELS[locale]}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}
