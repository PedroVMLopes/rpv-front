import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SheetPanelProps = {
    title?: string;
    className?: string;
    contentClassName?: string;
    children: ReactNode;
};

export function SheetPanel({
    title,
    className,
    contentClassName,
    children,
}: SheetPanelProps) {
    return (
        <Card
            className={cn(
                "min-w-0 max-w-full gap-3 rounded-2xl border py-0 shadow-sm",
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
