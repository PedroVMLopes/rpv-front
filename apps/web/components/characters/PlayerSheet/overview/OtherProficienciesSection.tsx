"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { partitionProficiencies } from "@/lib/character/proficiencyDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { getSystemRules } from "@/lib/character/systemRules";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

type OtherProficienciesSectionProps = {
    stored: StoredCharacter;
};

function ProficiencyChipList({
    title,
    items,
    emptyLabel,
}: {
    title: string;
    items: { id: string; label: string }[];
    emptyLabel: string;
}) {
    return (
        <div>
            <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                {title}
            </p>
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            ) : (
                <ul className="flex flex-wrap gap-1.5">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className={cn(
                                "rounded-full px-2.5 py-0.5 text-sm",
                                sheetInset
                            )}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function OtherProficienciesSection({
    stored,
}: OtherProficienciesSectionProps) {
    const t = useTranslations("playerSheet");

    const partitioned = useMemo(() => {
        const skills = getSystemRules(stored.system).skills;
        return partitionProficiencies(stored.grants ?? [], skills);
    }, [stored.grants, stored.system]);

    const sections = [
        { title: t("weapons"), items: partitioned.weapons },
        { title: t("armor"), items: partitioned.armor },
        { title: t("tools"), items: partitioned.tools },
        { title: t("languages"), items: partitioned.languages },
        { title: t("otherProficiencies"), items: partitioned.other },
    ].filter((section) => section.items.length > 0);

    if (sections.length === 0) {
        return (
            <section>
                <p className="text-sm text-muted-foreground">{t("noneYet")}</p>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-3">
            {sections.map((section) => (
                <ProficiencyChipList
                    key={section.title}
                    title={section.title}
                    items={section.items}
                    emptyLabel={t("noneYet")}
                />
            ))}
        </section>
    );
}
