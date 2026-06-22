"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { CharacterGrant } from "@rpv/domain";
import { CarouselItem } from "@/components/ui/characterCarousel";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { getLanguage } from "@/lib/catalog/grantCatalog";
import { getClass, getSpell, getSubclass } from "@rpv/content";
import {
    isGrantedFeaturesEntry,
    listGrantsBySource,
} from "@/lib/character/grantDisplay";
import { DerivedResourcesDisplay } from "@/components/characters/DerivedResourcesDisplay";

const SOURCE_LABEL_KEYS: Record<CharacterGrant["source"]["type"], string> = {
    race: "sourceRace",
    class: "sourceClass",
    subclass: "sourceSubclass",
    background: "sourceBackground",
    item: "sourceItem",
    spell: "sourceSpell",
    feat: "sourceFeat",
    condition: "sourceCondition",
    system: "sourceSystem",
};

function displayName(
    grant: CharacterGrant,
    contentLocale: ReturnType<typeof useContentLocale.getState>["contentLocale"]
): string {
    if (grant.name) {
        return grant.name;
    }

    if (grant.kind === "language") {
        return getLanguage(grant.ref)?.name ?? grant.ref;
    }

    if (grant.kind === "spell") {
        return getSpell(grant.ref, contentLocale)?.name ?? grant.ref;
    }

    return grant.ref;
}

function GrantSection({
    title,
    subtitle,
    emptyLabel,
    children,
}: {
    title: string;
    subtitle?: string;
    emptyLabel: string;
    children: ReactNode[] | ReactNode;
}) {
    const items = Array.isArray(children) ? children : [children];
    const hasItems = items.some(Boolean);

    return (
        <section>
            <h3 className="text-sm font-bold mb-2">{title}</h3>
            {subtitle ? (
                <p className="text-xs text-muted-foreground mb-1">{subtitle}</p>
            ) : null}
            {!hasItems ? (
                <p className="text-xs text-muted-foreground">{emptyLabel}</p>
            ) : (
                <ul className="text-sm space-y-1">{items}</ul>
            )}
        </section>
    );
}

interface CharacterCardAbilitiesProps {
    characterId: string;
}

export default function CharacterCardAbilities({
    characterId,
}: CharacterCardAbilitiesProps) {
    const t = useTranslations("grants");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const stored = useCharacterStore((state) =>
        state.characters.find((character) => character.id === characterId)
    );

    const grouped = useMemo(() => {
        const grants = stored?.grants ?? [];
        const map = new Map<string, CharacterGrant[]>();

        for (const grant of grants) {
            const key = `${grant.source.type}:${grant.source.id}`;
            const existing = map.get(key) ?? [];
            existing.push(grant);
            map.set(key, existing);
        }

        return Array.from(map.entries());
    }, [stored?.grants]);

    if (!stored) {
        return null;
    }

    const grants = stored.grants ?? [];
    const classSlug = stored.selections.characterClass;
    const subclassSlug = stored.selections.subclass;
    const className = classSlug
        ? (getClass(classSlug)?.name ?? classSlug)
        : undefined;
    const subclassName = subclassSlug
        ? (getSubclass(subclassSlug, contentLocale)?.name ?? subclassSlug)
        : undefined;

    const languages = grants.filter((grant) => grant.kind === "language");
    const features = grants.filter(isGrantedFeaturesEntry);
    const classFeatures = listGrantsBySource(grants, "class", ["ability"]);
    const subclassFeatures = listGrantsBySource(grants, "subclass", ["ability"]);
    const classSpells = listGrantsBySource(grants, "class", ["spell"]);
    const subclassSpells = listGrantsBySource(grants, "subclass", ["spell"]);

    return (
        <CarouselItem>
            <div className="flex flex-col gap-3 p-2">
                <DerivedResourcesDisplay
                    resources={stored.resources}
                    compact
                />

                {classSlug ? (
                    <GrantSection
                        title={t("classFeaturesTitle")}
                        subtitle={className}
                        emptyLabel={t("noneYet")}
                    >
                        {classFeatures.map((grant) => (
                            <li key={grant.id}>
                                {displayName(grant, contentLocale)}
                            </li>
                        ))}
                    </GrantSection>
                ) : null}

                {subclassSlug ? (
                    <GrantSection
                        title={t("subclassFeaturesTitle")}
                        subtitle={subclassName}
                        emptyLabel={t("noneYet")}
                    >
                        {subclassFeatures.map((grant) => (
                            <li key={grant.id}>
                                {displayName(grant, contentLocale)}
                            </li>
                        ))}
                    </GrantSection>
                ) : null}

                {classSlug || subclassSlug ? (
                    <GrantSection
                        title={t("classSpellsTitle")}
                        emptyLabel={t("noneYet")}
                    >
                        {[...classSpells, ...subclassSpells].map((grant) => (
                            <li key={grant.id}>
                                {displayName(grant, contentLocale)}
                            </li>
                        ))}
                    </GrantSection>
                ) : null}

                <GrantSection title={t("languagesTitle")} emptyLabel={t("noneYet")}>
                    {languages.map((grant) => (
                        <li key={grant.id}>
                            {displayName(grant, contentLocale)}
                        </li>
                    ))}
                </GrantSection>

                <section>
                    <h3 className="text-sm font-bold mb-2">
                        {t("grantedFeaturesTitle")}
                    </h3>
                    {features.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            {t("noneYet")}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {grouped.map(([sourceKey, sourceGrants]) => {
                                const featureGrants = sourceGrants.filter(
                                    isGrantedFeaturesEntry
                                );
                                if (featureGrants.length === 0) {
                                    return null;
                                }

                                const [sourceType] = sourceKey.split(":");
                                const sourceLabel = t(
                                    SOURCE_LABEL_KEYS[
                                        sourceType as CharacterGrant["source"]["type"]
                                    ] ?? "sourceSystem",
                                    { id: sourceGrants[0].source.id }
                                );

                                return (
                                    <div key={sourceKey}>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                                            {sourceLabel}
                                        </p>
                                        <ul className="text-sm space-y-1">
                                            {featureGrants.map((grant) => (
                                                <li key={grant.id}>
                                                    {displayName(
                                                        grant,
                                                        contentLocale
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </CarouselItem>
    );
}
