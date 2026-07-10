import { dndStatConfig } from "../presets/dnd/characterStats";
import {
    getDefaultCharacterName,
    isCharacterNamePending,
    resolveCharacterNameForSave,
} from "../lib/character/defaultCharacterName";
import { collectPendingDecisions } from "../lib/character/pendingDecisions";

describe("defaultCharacterName", () => {
    it("resolves empty names to locale defaults", () => {
        expect(resolveCharacterNameForSave("", "en")).toBe("Unnamed Character");
        expect(resolveCharacterNameForSave("   ", "pt-BR")).toBe("Sem Nome");
        expect(resolveCharacterNameForSave("Elara", "en")).toBe("Elara");
    });

    it("treats empty and placeholder names as pending", () => {
        expect(isCharacterNamePending("", "en")).toBe(true);
        expect(isCharacterNamePending("Unnamed Character", "en")).toBe(true);
        expect(isCharacterNamePending("Sem Nome", "pt-BR")).toBe(true);
        expect(isCharacterNamePending("Elara", "en")).toBe(false);
    });

    it("exposes default names per locale", () => {
        expect(getDefaultCharacterName("en")).toBe("Unnamed Character");
        expect(getDefaultCharacterName("pt-BR")).toBe("Sem Nome");
    });
});

describe("collectPendingDecisions", () => {
    it("lists structural gaps for an empty character", () => {
        const pending = collectPendingDecisions({}, "en", "dnd", dndStatConfig);
        const kinds = pending.map((decision) => decision.kind);

        expect(kinds).toEqual(
            expect.arrayContaining([
                "race",
                "class",
                "abilities",
                "background",
                "name",
            ])
        );
    });

    it("lists subclass when level requires it", () => {
        const pending = collectPendingDecisions(
            {
                race: "elf",
                characterClass: "fighter",
                level: 3,
                abilityScoreMethod: "manual",
                attributes: dndStatConfig.abilities.map((ability) => ({
                    name: ability.name,
                    value: 10,
                })),
                background: "sage",
                name: "Hero",
            },
            "en",
            "dnd",
            dndStatConfig
        );

        expect(pending.some((decision) => decision.kind === "subclass")).toBe(
            true
        );
    });

    it("lists missing grant picks for half-elf", () => {
        const pending = collectPendingDecisions(
            {
                race: "half-elf",
                characterClass: "fighter",
                background: "sage",
                name: "Hero",
                abilityScoreMethod: "manual",
                attributes: dndStatConfig.abilities.map((ability) => ({
                    name: ability.name,
                    value: 10,
                })),
            },
            "en",
            "dnd",
            dndStatConfig
        );

        expect(pending.some((decision) => decision.kind === "grant_pick")).toBe(
            true
        );
    });
});
