"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { CharacterGrant } from "@rpv/domain";
import { CarouselItem } from "@/components/ui/characterCarousel";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { getLanguage } from "@/lib/catalog/grantCatalog";
import { getSpell } from "@rpv/content";
import { listSpellSlotResources } from "@/lib/character/spellSlotResources";

const SOURCE_LABEL_KEYS: Record<CharacterGrant["source"]["type"], string> = {
    race: "sourceRace",
    class: "sourceClass",
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

function isDisplayableFeatureGrant(grant: CharacterGrant): boolean {
    return grant.kind !== "language" && grant.kind !== "resource";
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

    const languages = (stored.grants ?? []).filter(
        (grant) => grant.kind === "language"
    );
    const features = (stored.grants ?? []).filter(isDisplayableFeatureGrant);
    const spellSlots = listSpellSlotResources(stored.resources);

    return (
        <CarouselItem>
            <div className="flex flex-col gap-3 p-2">
                <section>
                    <h3 className="text-sm font-bold mb-2">{t("spellSlotsTitle")}</h3>
                    {spellSlots.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            {t("noneYet")}
                        </p>
                    ) : (
                        <ul className="text-sm space-y-1">
                            {spellSlots.map((slot) => (
                                <li key={slot.ref}>
                                    {t("spellSlotEntry", {
                                        level: slot.level,
                                        count: slot.count,
                                    })}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h3 className="text-sm font-bold mb-2">{t("languagesTitle")}</h3>
                    {languages.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            {t("noneYet")}
                        </p>
                    ) : (
                        <ul className="text-sm space-y-1">
                            {languages.map((grant) => (
                                <li key={grant.id}>
                                    {displayName(grant, contentLocale)}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

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
                            {grouped.map(([sourceKey, grants]) => {
                                const featureGrants = grants.filter(
                                    isDisplayableFeatureGrant
                                );
                                if (featureGrants.length === 0) {
                                    return null;
                                }

                                const [sourceType] = sourceKey.split(":");
                                const sourceLabel = t(
                                    SOURCE_LABEL_KEYS[
                                        sourceType as CharacterGrant["source"]["type"]
                                    ] ?? "sourceSystem",
                                    { id: grants[0].source.id }
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
