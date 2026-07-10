export type ParsedDiceNotation = {
    count: number;
    sides: number;
};

const DICE_NOTATION_PATTERN = /^(\d+)d(\d+)$/;

export function parseDiceNotation(notation: string): ParsedDiceNotation {
    const match = notation.trim().match(DICE_NOTATION_PATTERN);

    if (!match) {
        throw new Error(`Invalid dice notation: ${notation}`);
    }

    const count = Number(match[1]);
    const sides = Number(match[2]);

    if (!Number.isFinite(count) || count < 1 || !Number.isFinite(sides) || sides < 1) {
        throw new Error(`Invalid dice notation: ${notation}`);
    }

    return { count, sides };
}
