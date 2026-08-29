import {
    dndSkills,
    listLanguages,
    resolveGrantPool,
    type Grant,
} from "@rpv/content";
import type { Locale, ModifierSource } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { contentRepo } from "@/lib/content/contentRepository";
import { getRace, getSubrace } from "@/lib/catalog/raceCatalog";
import { collectGrantSources } from "./characterGrants";
import { buildSelectionsFromForm } from "./characterAdapter";
import { readLevelFromForm } from "./level";
import { parseGrantPickKey } from "./creationSteps/grantPickKey";
import type { CharacterSelections } from "./storedCharacter";

export type PendingChoiceGrant = {
    key: string;
    grant: Grant;
    source: ModifierSource;
    label: string;
    options: Array<{ value: string; label: string }>;
};

const SKILL_SLUGS = new Set(dndSkills.map((skill) => skill.slug));

/**
 * Skill slugs the character is already proficient in: fixed skill_proficiency
 * grants plus current skill_proficiency grant picks.
 */
export function listProficientSkillRefs(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel = 1,
    system: SystemKey = "dnd"
): Set<string> {
    const refs = new Set<string>();

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel,
        system
    )) {
        for (const grant of entry.grants) {
            if (grant.grantType !== "skill_proficiency" || grant.choose !== 0) {
                continue;
            }

            for (const option of grant.options ?? []) {
                if (option.optionType === "skill" && SKILL_SLUGS.has(option.ref)) {
                    refs.add(option.ref);
                }
            }
        }
    }

    const grantPicks = selections.choices.grantPicks ?? {};

    for (const [key, raw] of Object.entries(grantPicks)) {
        const ref = raw.trim();
        if (!ref || !SKILL_SLUGS.has(ref)) {
            continue;
        }

        const parsed = parseGrantPickKey(key);
        if (parsed?.grantType === "skill_proficiency") {
            refs.add(ref);
        }
    }

    return refs;
}

function formatChoiceLabel(
    baseLabel: string,
    grant: Grant,
    slot: number,
    featureLevel?: number
): string {
    let label =
        grant.choose > 1 ? `${baseLabel} (${slot + 1}/${grant.choose})` : baseLabel;

    if (featureLevel !== undefined) {
        label = `${label} (Level ${featureLevel})`;
    }

    return label;
}

function expandChoiceGrant(
    grant: Grant,
    source: ModifierSource,
    grantIndex: number,
    traitName: string,
    featureLevel?: number,
    system: SystemKey = "dnd",
    locale: Locale = "en",
    proficientSkillRefs: ReadonlySet<string> = new Set()
): PendingChoiceGrant[] {
    if (grant.choose <= 0) {
        return [];
    }

    const pool = resolveGrantPool(grant, {
        spells: contentRepo(system).listSpells(locale),
        languages: listLanguages(),
        system,
    });

    let options: Array<{ value: string; label: string }> = [];

    if (pool.languages) {
        options = pool.languages.map((language) => ({
            value: language.slug,
            label: language.name,
        }));
    } else if (pool.spells) {
        options = pool.spells.map((spell) => ({
            value: spell.slug,
            label: spell.name,
        }));
    } else if (pool.inventoryOptions) {
        options = pool.inventoryOptions;
    } else if (
        pool.options?.some((option) => option.optionType === "stat")
    ) {
        options = pool.options
            .filter(
                (option): option is Extract<typeof option, { optionType: "stat" }> =>
                    option.optionType === "stat"
            )
            .map((option) => ({
                value: option.ref,
                label: option.ref,
            }));
    } else if (pool.options) {
        const skillNames = new Map(
            dndSkills.map((skill) => [skill.slug, skill.name])
        );
        options = pool.options.map((option) => ({
            value: "ref" in option ? option.ref : "",
            label:
                option.optionType === "skill"
                    ? (skillNames.get(option.ref) ?? option.ref)
                    : "ref" in option
                      ? option.ref
                      : "",
        }));
    }

    if (
        grant.grantType === "skill_expertise" &&
        grant.selectionFilter?.fromProficientSkills
    ) {
        const skillNames = new Map(
            dndSkills.map((skill) => [skill.slug, skill.name])
        );
        options = [...proficientSkillRefs].map((slug) => ({
            value: slug,
            label: skillNames.get(slug) ?? slug,
        }));
    }

    const baseLabel =
        grant.description?.trim() ||
        traitName ||
        `${grant.grantType} choice`;

    const levelSegment =
        featureLevel !== undefined ? String(featureLevel) : "base";
    const results: PendingChoiceGrant[] = [];

    for (let slot = 0; slot < grant.choose; slot++) {
        const key =
            grant.grantType === "language"
                ? `${source.type}:${source.id}:${levelSegment}:language:${grantIndex}:${slot}`
                : `${source.type}:${source.id}:${levelSegment}:${grant.grantType}:${grantIndex}:${slot}`;

        results.push({
            key,
            grant,
            source,
            label: formatChoiceLabel(baseLabel, grant, slot, featureLevel),
            options,
        });
    }

    return results;
}

function collectFromTraits(
    traits: Array<{ name: string; grants: Grant[] }>,
    source: ModifierSource,
    system: SystemKey = "dnd",
    locale: Locale = "en",
    proficientSkillRefs: ReadonlySet<string> = new Set()
): PendingChoiceGrant[] {
    const pending: PendingChoiceGrant[] = [];

    traits.forEach((trait) => {
        trait.grants.forEach((grant, grantIndex) => {
            pending.push(
                ...expandChoiceGrant(
                    grant,
                    source,
                    grantIndex,
                    trait.name,
                    undefined,
                    system,
                    locale,
                    proficientSkillRefs
                )
            );
        });
    });

    return pending;
}

function collectFromGrants(
    grants: Grant[],
    source: ModifierSource,
    featureLevel?: number,
    system: SystemKey = "dnd",
    locale: Locale = "en",
    proficientSkillRefs: ReadonlySet<string> = new Set()
): PendingChoiceGrant[] {
    const pending: PendingChoiceGrant[] = [];

    grants.forEach((grant, grantIndex) => {
        pending.push(
            ...expandChoiceGrant(
                grant,
                source,
                grantIndex,
                "",
                featureLevel,
                system,
                locale,
                proficientSkillRefs
            )
        );
    });

    return pending;
}

export function collectPendingChoiceGrants(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel = 1,
    system: SystemKey = "dnd"
): PendingChoiceGrant[] {
    const pending: PendingChoiceGrant[] = [];
    const proficientSkillRefs = listProficientSkillRefs(
        selections,
        locale,
        characterLevel,
        system
    );

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel,
        system
    )) {
        if (
            entry.source.type === "race" &&
            selections.subrace &&
            entry.source.id === selections.subrace
        ) {
            const subrace = getSubrace(selections.subrace, locale);
            if (subrace) {
                pending.push(
                    ...collectFromTraits(
                        subrace.traits,
                        entry.source,
                        system,
                        locale,
                        proficientSkillRefs
                    )
                );
            }
            continue;
        }

        if (
            entry.source.type === "race" &&
            selections.race &&
            entry.source.id === selections.race
        ) {
            const race = getRace(selections.race, locale);
            pending.push(
                ...collectFromGrants(
                    race?.levelGrants ?? [],
                    entry.source,
                    undefined,
                    system,
                    locale,
                    proficientSkillRefs
                )
            );

            if (race) {
                pending.push(
                    ...collectFromTraits(
                        race.traits,
                        entry.source,
                        system,
                        locale,
                        proficientSkillRefs
                    )
                );
            }
            continue;
        }

        pending.push(
            ...collectFromGrants(
                entry.grants,
                entry.source,
                entry.featureLevel,
                system,
                locale,
                proficientSkillRefs
            )
        );
    }

    return pending;
}

export function collectLanguageChoiceGrants(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel = 1,
    system: SystemKey = "dnd"
): PendingChoiceGrant[] {
    return collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel,
        system
    ).filter((choice) => choice.grant.grantType === "language");
}

export function findChoiceGrantByKey(
    formData: Record<string, unknown>,
    key: string,
    locale: Locale,
    system: SystemKey = "dnd"
): PendingChoiceGrant | undefined {
    const selections = buildSelectionsFromForm(formData);
    const characterLevel = readLevelFromForm(formData);

    return collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel,
        system
    ).find((choice) => choice.key === key);
}

export function collectNonLanguageChoiceGrants(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel = 1,
    system: SystemKey = "dnd"
): PendingChoiceGrant[] {
    return collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel,
        system
    ).filter((choice) => choice.grant.grantType !== "language");
}
