/**
 * Reads character level from form or stored systemData.
 * Canonical source: `systemData.level`. Coerces string/number, floors, clamps 1–20.
 */
export function readLevelFromForm(formData: Record<string, unknown>): number {
    const level = formData.level;

    if (typeof level === "number" && Number.isFinite(level) && level >= 1) {
        return Math.min(Math.floor(level), 20);
    }

    if (typeof level === "string" && level.trim() !== "") {
        const parsed = Number(level);
        if (Number.isFinite(parsed) && parsed >= 1) {
            return Math.min(Math.floor(parsed), 20);
        }
    }

    return 1;
}
