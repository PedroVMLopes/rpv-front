"use client";

import { cn } from "@/lib/utils";

function CastingStatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-row items-baseline justify-between gap-4 text-xs">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-bold uppercase tabular-nums">{value}</dd>
        </div>
    );
}

type CastingStatsBlockProps = {
    className?: string;
    classLabel: string;
    abilityLabel: string;
    saveDcLabel: string;
    attackLabel: string;
    classNameValue: string;
    abilityValue: string;
    saveDcValue: number;
    attackValue: string;
};

export function CastingStatsBlock({
    className,
    classLabel,
    abilityLabel,
    saveDcLabel,
    attackLabel,
    classNameValue,
    abilityValue,
    saveDcValue,
    attackValue,
}: CastingStatsBlockProps) {
    return (
        <dl className={cn("flex flex-col gap-1.5", className)}>
            <CastingStatRow label={classLabel} value={classNameValue} />
            <CastingStatRow label={abilityLabel} value={abilityValue} />
            <CastingStatRow
                label={saveDcLabel}
                value={String(saveDcValue)}
            />
            <CastingStatRow label={attackLabel} value={attackValue} />
        </dl>
    );
}
