import {
    buildRaceResourcePreviewChips,
    hasDarkvision,
    parseDarkvisionRangeFeet,
} from "../lib/character/creation/raceCatalogResourceChips";

describe("raceCatalogResourceChips", () => {
    const labels = {
        speed: (speed: number) => `Speed: ${speed} ft`,
        darkvision: () => "Darkvision",
        darkvisionWithRange: (range: number) => `Darkvision: ${range} ft`,
    };

    it("parses darkvision range from vision text", () => {
        expect(
            parseDarkvisionRangeFeet(
                "You can see in dim light within 60 feet of you as if it were bright light."
            )
        ).toBe(60);
        expect(parseDarkvisionRangeFeet("Thanks to your elf blood.")).toBeUndefined();
    });

    it("detects darkvision in vision descriptions", () => {
        expect(hasDarkvision("**_Darkvision._** Within 60 feet.")).toBe(true);
        expect(hasDarkvision("Normal vision only.")).toBe(false);
        expect(hasDarkvision(undefined)).toBe(false);
    });

    it("builds speed and darkvision chips for races with both", () => {
        expect(
            buildRaceResourcePreviewChips(
                {
                    speedWalk: 25,
                    visionDesc:
                        "**_Darkvision._** You can see in dim light within 60 feet of you.",
                },
                labels
            )
        ).toEqual([
            { id: "speed", label: "Speed: 25 ft" },
            { id: "darkvision", label: "Darkvision: 60 ft" },
        ]);
    });

    it("builds darkvision chip without range when distance is missing", () => {
        expect(
            buildRaceResourcePreviewChips(
                {
                    speedWalk: 30,
                    visionDesc: "**_Darkvision._** Thanks to your elf blood.",
                },
                labels
            )
        ).toEqual([
            { id: "speed", label: "Speed: 30 ft" },
            { id: "darkvision", label: "Darkvision" },
        ]);
    });

    it("omits darkvision when vision text does not mention it", () => {
        expect(
            buildRaceResourcePreviewChips(
                {
                    speedWalk: 30,
                    visionDesc: "",
                },
                labels
            )
        ).toEqual([{ id: "speed", label: "Speed: 30 ft" }]);
    });
});
