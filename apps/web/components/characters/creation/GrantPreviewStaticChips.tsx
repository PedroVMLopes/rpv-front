import type { ResourcePreviewChip } from "@/lib/character/creation/raceCatalogResourceChips";
import { cn } from "@/lib/utils";

type GrantPreviewStaticChipsProps = {
    chips: ResourcePreviewChip[];
    className?: string;
};

export function GrantPreviewStaticChips({
    chips,
    className,
}: GrantPreviewStaticChipsProps) {
    if (chips.length === 0) {
        return null;
    }

    return (
        <ul className={cn("flex flex-wrap gap-1.5", className)}>
            {chips.map((chip) => (
                <li key={chip.id}>
                    <span className="inline-flex rounded-full border bg-muted/50 px-2 py-0.5 text-xs">
                        {chip.label}
                    </span>
                </li>
            ))}
        </ul>
    );
}
