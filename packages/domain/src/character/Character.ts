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

    toProps(): CharacterProps {
        return {
            ...this.props,
            baseStats: { ...this.props.baseStats },
            modifiers: [...this.props.modifiers],
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

    getResolvedStats(): Stats {
        return resolveStats(this.props.baseStats, this.props.modifiers);
    }
}
