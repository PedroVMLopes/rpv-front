import type { Grant } from "@rpv/content";
import {
    fixedGrantsToCharacterGrants,
    getSpell,
    type GrantOption,
} from "@rpv/content";
import type { Locale, ModifierSource } from "@rpv/domain";
import { formatClassStepGrantLabel } from "@/lib/character/classStepDisplay";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import { contentRepo } from "@/lib/content/contentRepository";
import type { SystemKey } from "@/presets";

export type GrantPreviewItem =
    | {
          kind: "fixed";
          id: string;
          label: string;
          grant: Grant;
          spellRef?: string;
          itemRef?: string;
      }
    | {
          kind: "deferred";
          id: string;
          label: string;
          grant: Grant;
          choose: number;
          syntheticKey: string;
      };

function humanizeRef(ref: string): string {
    return ref
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function resolveSpellRef(grant: Grant): string | undefined {
    if (grant.ref?.trim()) {
        return grant.ref.trim();
    }

    const spellOption = grant.options?.find(
        (option): option is Extract<GrantOption, { optionType: "spell" }> =>
            option.optionType === "spell"
    );

    return spellOption?.ref;
}

function resolveItemRef(grant: Grant): string | undefined {
    if (grant.grantType !== "inventory_item") {
        return undefined;
    }

    return grant.ref?.trim() || undefined;
}

function buildSyntheticPickKey(
    grant: Grant,
    grantIndex: number,
    source: ModifierSource,
    featureLevel?: number
): string {
    const levelSegment =
        featureLevel !== undefined ? String(featureLevel) : "base";

    return `${source.type}:${source.id}:${levelSegment}:${grant.grantType}:${grantIndex}:0`;
}

export function buildGrantPreviewItems(
    grants: Grant[],
    source: ModifierSource,
    locale: Locale,
    system: SystemKey,
    translateAbility: (ref: string) => string,
    translateResource: (ref: string) => string,
    featureLevel?: number
): GrantPreviewItem[] {
    const items: GrantPreviewItem[] = [];

    grants.forEach((grant, grantIndex) => {
        if (grant.choose > 0) {
            items.push({
                kind: "deferred",
                id: `deferred-${grantIndex}`,
                label:
                    grant.description?.trim() ||
                    `${humanizeRef(grant.grantType)} choice`,
                grant,
                choose: grant.choose,
                syntheticKey: buildSyntheticPickKey(
                    grant,
                    grantIndex,
                    source,
                    featureLevel
                ),
            });
            return;
        }

        const spellRef = grant.grantType === "spell" ? resolveSpellRef(grant) : undefined;
        const itemRef = resolveItemRef(grant);

        if (spellRef) {
            const spell = getSpell(spellRef, locale);
            items.push({
                kind: "fixed",
                id: `spell-${grantIndex}-${spellRef}`,
                label: spell?.name ?? humanizeRef(spellRef),
                grant,
                spellRef,
            });
            return;
        }

        if (itemRef) {
            const item = contentRepo(system).getItem(itemRef, locale);
            items.push({
                kind: "fixed",
                id: `item-${grantIndex}-${itemRef}`,
                label: item?.name ?? humanizeRef(itemRef),
                grant,
                itemRef,
            });
            return;
        }

        const characterGrants = fixedGrantsToCharacterGrants(
            [grant],
            source,
            { featureLevel }
        );

        if (characterGrants.length > 0) {
            characterGrants.forEach((characterGrant, characterGrantIndex) => {
                items.push({
                    kind: "fixed",
                    id: `fixed-${grantIndex}-${characterGrantIndex}`,
                    label: formatClassStepGrantLabel(
                        characterGrant,
                        locale,
                        translateAbility,
                        (ref) => formatResourceRefLabel(ref, translateResource)
                    ),
                    grant,
                });
            });
            return;
        }

        items.push({
            kind: "fixed",
            id: `fixed-${grantIndex}`,
            label: grant.description?.trim() || humanizeRef(grant.grantType),
            grant,
        });
    });

    return items;
}
