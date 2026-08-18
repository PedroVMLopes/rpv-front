import { getAbilityFeatureDescription } from "../src/curation/featureDescriptions.dnd";

describe("getAbilityFeatureDescription", () => {
    it("returns race trait description from catalog", () => {
        expect(
            getAbilityFeatureDescription("Fey Ancestry", {
                type: "race",
                id: "elf",
            })
        ).toContain("advantage on saving throws against being charmed");
    });

    it("returns curated class feature description in English", () => {
        expect(
            getAbilityFeatureDescription("Action Surge", {
                type: "class",
                id: "fighter",
            })
        ).toContain("additional action");
    });

    it("returns localized curated description for pt-BR", () => {
        expect(
            getAbilityFeatureDescription(
                "Second Wind",
                { type: "class", id: "fighter" },
                "pt-BR"
            )
        ).toContain("ação bônus");
    });

    it("returns undefined for unknown features", () => {
        expect(
            getAbilityFeatureDescription("Unknown Feature", {
                type: "class",
                id: "fighter",
            })
        ).toBeUndefined();
    });

    it("returns curated background feature description in English", () => {
        expect(
            getAbilityFeatureDescription("Researcher", {
                type: "background",
                id: "sage",
            })
        ).toContain("scholar or archive");
    });

    it("returns localized background feature description for pt-BR", () => {
        expect(
            getAbilityFeatureDescription(
                "Researcher",
                { type: "background", id: "sage" },
                "pt-BR"
            )
        ).toContain("estudioso ou arquivo");
    });
});
