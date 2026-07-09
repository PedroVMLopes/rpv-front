import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sheetPanel } from "@/components/characters/PlayerSheet/playerSheetSurfaces";

type SheetPanelVariant = "default" | "nested";

type SheetPanelProps = {
    title?: string;
    className?: string;
    contentClassName?: string;
    variant?: SheetPanelVariant;
    children: ReactNode;
};

export function SheetPanel({
    title,
    className,
    contentClassName,
    variant = "default",
    children,
}: SheetPanelProps) {
    return (
        <Card
            className={cn(
                "min-w-0 max-w-full gap-3 rounded-2xl border py-0",
                variant === "default" && "bg-card shadow-sm",
                variant === "nested" && cn(sheetPanel, "shadow-xs"),
                className
            )}
        >
            {title ? (
                <CardHeader className="px-3 pt-3 pb-0">
                    <CardTitle className="text-sm font-bold">{title}</CardTitle>
                </CardHeader>
            ) : null}
            <CardContent
                className={cn(
                    "px-3 pb-3",
                    title ? "pt-2" : "pt-3",
                    contentClassName
                )}
            >
                {children}
            </CardContent>
        </Card>
    );
}
