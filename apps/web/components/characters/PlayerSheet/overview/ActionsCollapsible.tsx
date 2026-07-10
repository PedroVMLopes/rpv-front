"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type ActionsCollapsibleProps = {
    title: string;
    headerExtra?: ReactNode;
    defaultOpen?: boolean;
    children: ReactNode;
};

export function ActionsCollapsible({
    title,
    headerExtra,
    defaultOpen = false,
    children,
}: ActionsCollapsibleProps) {
    const t = useTranslations("playerSheet");

    return (
        <Collapsible defaultOpen={defaultOpen} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <CollapsibleTrigger
                    className={cn(
                        "group flex min-w-0 flex-1 items-center gap-1.5 text-left",
                        "text-xs font-semibold uppercase text-muted-foreground",
                        "hover:text-foreground"
                    )}
                    aria-label={t("expandSection", { title })}
                >
                    <ChevronDown
                        className={cn(
                            "size-3.5 shrink-0 transition-transform",
                            "group-data-[state=open]:rotate-180"
                        )}
                        aria-hidden
                    />
                    <span>{title}</span>
                </CollapsibleTrigger>
                {headerExtra ? (
                    <div className="shrink-0">{headerExtra}</div>
                ) : null}
            </div>
            <CollapsibleContent className="flex flex-col gap-2 data-[state=closed]:hidden">
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
}
