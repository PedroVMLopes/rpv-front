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

    it("lists invalid duplicate spell picks even when nothing is missing", () => {
        const pending = collectPendingDecisions(
            {
                race: "elf",
                subrace: "high-elf",
                characterClass: "wizard",
                level: 1,
                background: "sage",
                name: "Hero",
                abilityScoreMethod: "manual",
                attributes: dndStatConfig.abilities.map((ability) => ({
                    name: ability.name,
                    value: 10,
                })),
                choices: {
                    grantPicks: {
                        "race:high-elf:base:language:0:0": "draconic",
                        "race:high-elf:base:spell:0:0": "acid-splash",
                        "class:wizard:base:skill_proficiency:2:0": "arcana",
                        "class:wizard:base:skill_proficiency:2:1": "history",
                        "class:wizard:1:spell:1:0": "acid-splash",
                        "class:wizard:1:spell:1:1": "mage-hand",
                        "class:wizard:1:spell:1:2": "prestidigitation",
                        "class:wizard:1:spell:2:0": "burning-hands",
                        "class:wizard:1:spell:2:1": "magic-missile",
                    },
                },
            },
            "en",
            "dnd",
            dndStatConfig
        );

        expect(
            pending.some((decision) => decision.kind === "invalid_grant_pick")
        ).toBe(true);
        expect(
            pending.some(
                (decision) =>
                    decision.kind === "invalid_grant_pick" &&
                    decision.stepId === "class-level-1-cantrips"
            )
        ).toBe(true);
    });

    it("excludes level 4+ missing picks in creation scope for level 5 wizard", () => {
        const full = collectPendingDecisions(
            {
                race: "human",
                characterClass: "wizard",
                level: 5,
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
            dndStatConfig,
            "full"
        );

        const creation = collectPendingDecisions(
            {
                race: "human",
                characterClass: "wizard",
                level: 5,
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
            dndStatConfig,
            "creation"
        );

        const fullGrantKeys = full
            .filter((decision) => decision.kind === "grant_pick")
            .map((decision) => decision.id);
        const creationGrantKeys = creation
            .filter((decision) => decision.kind === "grant_pick")
            .map((decision) => decision.id);

        expect(fullGrantKeys.some((id) => id.includes(":4:"))).toBe(true);
        expect(creationGrantKeys.some((id) => id.includes(":4:"))).toBe(false);
    });
});
