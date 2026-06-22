"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseDerivedResources } from "@/lib/character/deriveResourcesFromForm";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";

type DerivedResourcesDisplayProps = {
    resources: Record<string, number>;
    emptyHint?: string;
    compact?: boolean;
};

function ResourceSection({
    title,
    emptyLabel,
    children,
    compact,
}: {
    title: string;
    emptyLabel: string;
    children: ReactNode[] | ReactNode;
    compact?: boolean;
}) {
    const items = Array.isArray(children) ? children : [children];
    const hasItems = items.some(Boolean);

    return (
        <section>
            <h3
                className={
                    compact
                        ? "text-sm font-bold mb-2"
                        : "text-sm font-semibold mb-1"
                }
            >
                {title}
            </h3>
            {!hasItems ? (
                <p className="text-xs text-muted-foreground">{emptyLabel}</p>
            ) : (
                <ul className="text-sm space-y-1">{items}</ul>
            )}
        </section>
    );
}

export function DerivedResourcesDisplay({
    resources,
    emptyHint,
    compact = false,
}: DerivedResourcesDisplayProps) {
    const tGrants = useTranslations("grants");
    const tResources = useTranslations("classResources");

    const { spellSlots, classResources } = useMemo(
        () => parseDerivedResources(resources),
        [resources]
    );

    const hasAnyResources =
        spellSlots.length > 0 || classResources.length > 0;

    if (!hasAnyResources) {
        if (emptyHint) {
            return (
                <p className="text-sm text-muted-foreground">{emptyHint}</p>
            );
        }

        return null;
    }

    const formatLabel = (ref: string) =>
        formatResourceRefLabel(ref, (key) => tResources(key));

    return (
        <div className={compact ? "flex flex-col gap-3" : "flex flex-col gap-4"}>
            <ResourceSection
                title={tGrants("spellSlotsTitle")}
                emptyLabel={tResources("noneYet")}
                compact={compact}
            >
                {spellSlots.map((slot) => (
                    <li key={slot.ref}>
                        {tGrants("spellSlotEntry", {
                            level: slot.level,
                            count: slot.count,
                        })}
                    </li>
                ))}
            </ResourceSection>

            <ResourceSection
                title={tGrants("classResourcesTitle")}
                emptyLabel={tResources("noneYet")}
                compact={compact}
            >
                {classResources.map((resource) => (
                    <li key={resource.ref}>
                        {formatLabel(resource.ref)}: {resource.count}
                    </li>
                ))}
            </ResourceSection>
        </div>
    );
}
