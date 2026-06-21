/**
 * Reads character level from form or stored systemData.
 * Coerces string/number; floors; minimum 1.
 */
export function readLevelFromForm(formData: Record<string, unknown>): number {
    const level = formData.level;

    if (typeof level === "number" && Number.isFinite(level) && level >= 1) {
        return Math.floor(level);
    }

    if (typeof level === "string" && level.trim() !== "") {
        const parsed = Number(level);
        if (Number.isFinite(parsed) && parsed >= 1) {
            return Math.floor(parsed);
        }
    }

    return 1;
}
