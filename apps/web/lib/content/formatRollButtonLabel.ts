import { formatModifier } from "@/lib/character/skillModifiers";

export type RollButtonLabelInput = {
    primary: string;
    modifier?: number | null;
};

export function formatRollButtonLabel(input: RollButtonLabelInput): string {
    const { primary, modifier } = input;

    if (modifier === null || modifier === undefined || modifier === 0) {
        return primary;
    }

    return `${primary} ${formatModifier(modifier)}`;
}
