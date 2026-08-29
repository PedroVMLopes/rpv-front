import { cn } from "@/lib/utils";

type ProficiencyPipsProps = {
    scale: number;
    proficientLabel: string;
    expertiseLabel: string;
    /** When true, render a hollow pip at scale 0 (ability-check rows). */
    showEmpty?: boolean;
};

export function ProficiencyPips({
    scale,
    proficientLabel,
    expertiseLabel,
    showEmpty = false,
}: ProficiencyPipsProps) {
    if (scale < 1 && !showEmpty) {
        return null;
    }

    const label = scale >= 2 ? expertiseLabel : proficientLabel;
    const filled = scale >= 1;

    return (
        <span
            className="flex shrink-0 items-center gap-0.5"
            title={label}
            aria-label={label}
        >
            <span
                className={cn(
                    "size-1.5 shrink-0 rounded-full border",
                    filled
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40"
                )}
                aria-hidden
            />
            {scale >= 2 ? (
                <span
                    className="size-1.5 shrink-0 rounded-full border border-primary bg-primary"
                    aria-hidden
                />
            ) : null}
        </span>
    );
}
