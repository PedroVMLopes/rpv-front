import {
    Character as DomainCharacter,
    CharacterProps,
    CharacterType,
    Modifier,
    Stats,
    resolveStats,
} from "@rpv/domain";
import { SystemKey } from "@/presets";
import { buildBaseStatsFromForm } from "./presetStats";

type FormAttribute = {
    name: string;
    value?: number;
};

export type CharacterFormData = {
    name: string;
    hp?: number;
    maxHp?: number;
    ac?: number;
    attributes?: FormAttribute[];
};

export function formDataToBaseStats(data: CharacterFormData, system: SystemKey): Stats {
    return buildBaseStatsFromForm(data.attributes, data, system);
}

export function formDataToCharacterProps(
    data: CharacterFormData,
    id: string,
    type: CharacterType,
    system: SystemKey,
    modifiers: Modifier[] = []
): CharacterProps {
    return {
        id,
        type,
        name: data.name,
        baseStats: formDataToBaseStats(data, system),
        modifiers,
    };
}

export function characterPropsToDomain(props: CharacterProps): DomainCharacter {
    return DomainCharacter.create(props);
}

export function getResolvedStatsForCharacter(
    props: Pick<CharacterProps, "baseStats" | "modifiers">
): Stats {
    return resolveStats(props.baseStats, props.modifiers);
}

export function syncBaseStatsFromForm(
    existing: CharacterProps,
    data: CharacterFormData,
    system: SystemKey
): CharacterProps {
    return {
        ...existing,
        name: data.name ?? existing.name,
        baseStats: formDataToBaseStats(data, system),
    };
}
