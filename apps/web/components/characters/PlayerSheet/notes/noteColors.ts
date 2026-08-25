import { NOTE_COLORS, type NoteColor } from "@/lib/character/storedCharacter";
import type { NoteColorChoice } from "@/lib/character/notes";
import { cn } from "@/lib/utils";

export const NOTE_COLOR_CHOICES: readonly NoteColorChoice[] = [
    "default",
    ...NOTE_COLORS,
];

const NOTE_SWATCH_FILL: Record<NoteColor, string> = {
    "chart-1": "bg-chart-1",
    "chart-2": "bg-chart-2",
    "chart-3": "bg-chart-3",
    "chart-4": "bg-chart-4",
    "chart-5": "bg-chart-5",
};

export function noteSwatchClass(choice: NoteColorChoice): string {
    if (choice === "default") {
        return "bg-popover border border-popover-border";
    }

    return NOTE_SWATCH_FILL[choice];
}

export function noteSurfaceClass(
    color: NoteColor | NoteColorChoice | undefined
): string {
    const choice: NoteColorChoice =
        color === undefined || color === "default" ? "default" : color;

    if (choice === "default") {
        return "bg-popover text-popover-foreground";
    }

    return cn(NOTE_SWATCH_FILL[choice], "text-popover-foreground");
}

export function savedNoteColorChoice(
    color: NoteColor | undefined
): NoteColorChoice {
    return color ?? "default";
}
