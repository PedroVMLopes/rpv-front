import { formatResourceRefLabel } from "../lib/character/resourceLabels";

describe("formatResourceRefLabel", () => {
    const t = (key: string) => {
        const labels: Record<string, string> = {
            "refs.rage-uses": "Rage Uses",
            "refs.ki-points": "Ki Points",
        };

        return labels[key] ?? key;
    };

    it("returns translated label for known refs", () => {
        expect(formatResourceRefLabel("rage-uses", t)).toBe("Rage Uses");
        expect(formatResourceRefLabel("ki-points", t)).toBe("Ki Points");
    });

    it("humanizes unknown refs as fallback", () => {
        expect(formatResourceRefLabel("custom-resource", t)).toBe(
            "Custom Resource"
        );
    });
});
