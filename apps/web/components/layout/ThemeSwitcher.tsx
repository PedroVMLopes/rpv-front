"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { FaMoon, FaSun } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

export default function ThemeSwitcher() {
    const t = useTranslations("common");
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!mounted}
            aria-label={isDark ? t("themeLight") : t("themeDark")}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {mounted ? (
                isDark ? (
                    <FaSun aria-hidden />
                ) : (
                    <FaMoon aria-hidden />
                )
            ) : (
                <FaMoon className="opacity-0" aria-hidden />
            )}
        </Button>
    );
}
