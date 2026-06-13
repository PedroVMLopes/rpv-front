import { CharacterGrant } from "../grants/characterGrant.types";
import {
    getAbilities,
    getLanguages,
    getProficiencies,
    getSpells,
} from "../grants/characterGrant.utils";
import { Modifier } from "../modifiers/modifier.types";
import { resolveStats, Stats } from "../modifiers/modifier.resolver";
import { CharacterProps } from "./Character.types";

export class Character {
    private readonly props: CharacterProps;

    constructor(props: CharacterProps) {
        this.props = props;
    }

    static create(props: CharacterProps): Character {
        return new Character(props);
    }

    getId(): string {
        return this.props.id;
    }

    getType(): CharacterProps["type"] {
        return this.props.type;
    }

    getName(): string {
        return this.props.name;
    }

    getBaseStats(): Stats {
        return { ...this.props.baseStats };
    }

    getModifiers(): Modifier[] {
        return [...this.props.modifiers];
    }

    getGrants(): CharacterGrant[] {
        return [...(this.props.grants ?? [])];
    }

    getLanguages(): CharacterGrant[] {
        return getLanguages(this.props.grants ?? []);
    }

    getAbilities(): CharacterGrant[] {
        return getAbilities(this.props.grants ?? []);
    }

    getSpells(): CharacterGrant[] {
        return getSpells(this.props.grants ?? []);
    }

    getProficiencies(): CharacterGrant[] {
        return getProficiencies(this.props.grants ?? []);
    }

    toProps(): CharacterProps {
        return {
            ...this.props,
            baseStats: { ...this.props.baseStats },
            modifiers: [...this.props.modifiers],
            grants: [...(this.props.grants ?? [])],
        };
    }

    addModifier(modifier: Modifier): Character {
        return new Character({
            ...this.props,
            modifiers: [...this.props.modifiers, modifier],
        });
    }

    removeModifier(id: string): Character {
        return new Character({
            ...this.props,
            modifiers: this.props.modifiers.filter((m) => m.id !== id),
        });
    }

    addGrant(grant: CharacterGrant): Character {
        return new Character({
            ...this.props,
            grants: [...(this.props.grants ?? []), grant],
        });
    }

    removeGrant(id: string): Character {
        return new Character({
            ...this.props,
            grants: (this.props.grants ?? []).filter((g) => g.id !== id),
        });
    }

    getResolvedStats(): Stats {
        return resolveStats(this.props.baseStats, this.props.modifiers);
    }
}
