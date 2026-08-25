import { NOTE_COLORS, type NoteColor } from "@/lib/character/storedCharacter";
import type { NoteColorChoice } from "@/lib/character/notes";
import { cn } from "@/lib/utils";

export const NOTE_COLOR_CHOICES: readonly NoteColorChoice[] = [
    "default",
    ...NOTE_COLORS,
];

const NOTE_SWATCH_FILL: Record<NoteColor, string> = {
    yellow: "bg-amber-200",
    orange: "bg-orange-200",
    red: "bg-red-200",
    green: "bg-lime-200",
    blue: "bg-sky-200",
    purple: "bg-violet-200",
};

export function noteSwatchClass(choice: NoteColorChoice): string {
    if (choice === "default") {
        return "bg-transparent border border-foreground/40";
    }

    return NOTE_SWATCH_FILL[choice];
}

export function noteSurfaceClass(
    color: NoteColor | NoteColorChoice | undefined,
    surface: "card" | "modal"
): string {
    const choice: NoteColorChoice =
        color === undefined || color === "default" ? "default" : color;

    if (choice === "default") {
        return surface === "card"
            ? "bg-popover text-popover-foreground"
            : "bg-card text-card-foreground";
    }

    return cn(NOTE_SWATCH_FILL[choice], "text-popover-foreground");
}

export function savedNoteColorChoice(
    color: NoteColor | undefined
): NoteColorChoice {
    return color ?? "default";
}
