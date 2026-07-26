import { Badge } from "@/components/ui/badge";
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
                    <Badge variant="secondary">
                        {chip.label}
                    </Badge>
                </li>
            ))}
        </ul>
    );
}
