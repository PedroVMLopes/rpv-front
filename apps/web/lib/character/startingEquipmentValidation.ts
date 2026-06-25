import type { Locale } from "@rpv/domain";
import {
    buildCurrencyChoiceKey,
    buildInventoryItemChoiceKey,
    collectExclusiveGroupChoices,
    isGrantInActiveExclusiveBranch,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "./characterAdapter";
import { collectGrantSources } from "./characterGrants";
import { STARTING_EQUIPMENT_SOURCES } from "./materializeCurrencyGrants";
import type { CharacterSelections } from "./storedCharacter";
import { readLevelFromForm } from "./level";

export function collectValidStartingEquipmentPickKeys(
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel: number
): Set<string> {
    const validKeys = new Set<string>();
    const grantPicks = selections.choices.grantPicks ?? {};

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel
    )) {
        if (!STARTING_EQUIPMENT_SOURCES.has(entry.source.type)) {
            continue;
        }

        for (const group of collectExclusiveGroupChoices(
            entry.grants,
            entry.source,
            entry.featureLevel
        )) {
            validKeys.add(group.key);
        }

        const context = {
            sourceType: entry.source.type,
            sourceId: entry.source.id,
            featureLevel: entry.featureLevel,
        };

        entry.grants.forEach((grant, grantIndex) => {
            if (!isGrantInActiveExclusiveBranch(grant, grantPicks, context)) {
                return;
            }

            if (grant.grantType === "inventory_item" && grant.choose > 0) {
                for (let slot = 0; slot < grant.choose; slot++) {
                    validKeys.add(
                        buildInventoryItemChoiceKey({
                            sourceType: context.sourceType,
                            sourceId: context.sourceId,
                            grantIndex,
                            slot,
                            featureLevel: context.featureLevel,
                        })
                    );
                }
            }

            if (grant.grantType === "currency" && grant.choose > 0) {
                for (let slot = 0; slot < grant.choose; slot++) {
                    validKeys.add(
                        buildCurrencyChoiceKey({
                            sourceType: context.sourceType,
                            sourceId: context.sourceId,
                            grantIndex,
                            slot,
                            featureLevel: context.featureLevel,
                        })
                    );
                }
            }
        });
    }

    return validKeys;
}

export function findMissingExclusiveGroupPicks(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey
): Array<{ key: string; label: string; source: { type: string; id: string } }> {
    const characterSelections = buildSelectionsFromForm(formData);
    const characterLevel = readLevelFromForm(formData);
    const grantPicks =
        (formData.choices as { grantPicks?: Record<string, string> } | undefined)
            ?.grantPicks ?? {};

    const missing: Array<{
        key: string;
        label: string;
        source: { type: string; id: string };
    }> = [];

    for (const entry of collectGrantSources(
        characterSelections,
        locale,
        characterLevel
    )) {
        if (!STARTING_EQUIPMENT_SOURCES.has(entry.source.type)) {
            continue;
        }

        for (const group of collectExclusiveGroupChoices(
            entry.grants,
            entry.source,
            entry.featureLevel
        )) {
            const pick = grantPicks[group.key]?.trim();
            if (!pick) {
                missing.push({
                    key: group.key,
                    label: group.label,
                    source: group.source,
                });
            }
        }
    }

    return missing;
}
