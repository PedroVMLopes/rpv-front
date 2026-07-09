"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaGear, FaUser } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function isRouteActive(pathname: string, href: string): boolean {
    if (href === "/") {
        return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClassName(active: boolean): string {
    return cn(
        "text-sm font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const t = useTranslations("nav");

    const isHomeActive = isRouteActive(pathname, "/");
    const isCharactersActive = isRouteActive(pathname, "/characters");
    const isEncountersActive = isRouteActive(pathname, "/encounters");
    const isUserActive = isRouteActive(pathname, "/user");

    return (
        <header className="flex w-full items-center justify-between gap-4">
            <nav
                className="flex min-w-0 items-center gap-3 sm:gap-4"
                aria-label="Main"
            >
                <Link
                    href="/"
                    className={cn(
                        "font-serif text-lg font-bold tracking-tight transition-colors",
                        isHomeActive
                            ? "text-primary"
                            : "text-foreground hover:text-primary"
                    )}
                >
                    RPV
                </Link>

                <Separator
                    orientation="vertical"
                    className="h-5 bg-border"
                />

                <Link
                    href="/characters"
                    className={navLinkClassName(isCharactersActive)}
                >
                    {t("characters")}
                </Link>

                <Link
                    href="/encounters"
                    className={navLinkClassName(isEncountersActive)}
                >
                    {t("encounters")}
                </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-1">
                <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className={cn(isUserActive && "text-primary")}
                >
                    <Link href="/user" aria-label={t("settings")}>
                        <FaGear className="size-4" />
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className={cn(isUserActive && "text-primary")}
                >
                    <Link href="/user" aria-label={t("user")}>
                        <FaUser className="size-4" />
                    </Link>
                </Button>
            </div>
        </header>
    );
}
