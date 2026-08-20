"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SheetDiceFaceButtonProps = Omit<
    ComponentProps<typeof Button>,
    "variant" | "size" | "type"
> & {
    selected?: boolean;
};

export function SheetDiceFaceButton({
    selected,
    className,
    ...props
}: SheetDiceFaceButtonProps) {
    return (
        <Button
            type="button"
            size="sm"
            variant={selected ? "default" : "secondary"}
            aria-pressed={selected}
            className={cn("border-2 font-semibold", className)}
            {...props}
        />
    );
}
