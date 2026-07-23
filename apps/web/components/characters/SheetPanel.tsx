import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sheetPanel } from "@/components/characters/PlayerSheet/playerSheetSurfaces";

type SheetPanelVariant = "default" | "nested";

type SheetPanelProps = {
    title?: string;
    headerAction?: ReactNode;
    className?: string;
    contentClassName?: string;
    variant?: SheetPanelVariant;
    children: ReactNode;
};

export function SheetPanel({
    title,
    headerAction,
    className,
    contentClassName,
    variant = "default",
    children,
}: SheetPanelProps) {
    const hasHeader = Boolean(title || headerAction);

    return (
        <Card
            className={cn(
                "min-w-0 max-w-full gap-1.5 rounded-2xl border py-0",
                variant === "default" && "bg-card text-card-foreground shadow-sm",
                variant === "nested" && cn(sheetPanel, "shadow-xs"),
                className
            )}
        >
            {hasHeader ? (
                <CardHeader className="px-3 pt-3 pb-0">
                    <div className="flex items-center justify-between gap-2">
                        {title ? (
                            <CardTitle className="text-sm font-bold">
                                {title}
                            </CardTitle>
                        ) : (
                            <span />
                        )}
                        {headerAction}
                    </div>
                </CardHeader>
            ) : null}
            <CardContent
                className={cn(
                    "px-3 pb-3",
                    hasHeader ? "pt-0" : "pt-3",
                    contentClassName
                )}
            >
                {children}
            </CardContent>
        </Card>
    );
}
