import {
    getAbilityFeatureDescription,
    getAbilityFeatureName,
} from "../src/curation/featureDescriptions.dnd";

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
        expect(
            getAbilityFeatureDescription("Flurry of Blows", {
                type: "class",
                id: "monk",
            })
        ).toContain("two unarmed strikes");
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

    it("returns curated acolyte feature description in English", () => {
        expect(
            getAbilityFeatureDescription("Shelter of the Faithful", {
                type: "background",
                id: "acolyte",
            })
        ).toContain("free healing and care");
    });

    it("returns localized acolyte feature description for pt-BR", () => {
        expect(
            getAbilityFeatureDescription(
                "Shelter of the Faithful",
                { type: "background", id: "acolyte" },
                "pt-BR"
            )
        ).toContain("cura e cuidados gratuitos");
    });

    it("returns curated guild artisan feature description in English", () => {
        expect(
            getAbilityFeatureDescription("Guild Membership", {
                type: "background",
                id: "guild-artisan",
            })
        ).toContain("chapter hall");
    });

    it("returns localized guild artisan feature description for pt-BR", () => {
        expect(
            getAbilityFeatureDescription(
                "Guild Membership",
                { type: "background", id: "guild-artisan" },
                "pt-BR"
            )
        ).toContain("sede");
    });

    it("returns curated charlatan feature description in English", () => {
        expect(
            getAbilityFeatureDescription("False Identity", {
                type: "background",
                id: "charlatan",
            })
        ).toContain("second, fully prepared identity");
    });

    it("returns localized charlatan feature description for pt-BR", () => {
        expect(
            getAbilityFeatureDescription(
                "False Identity",
                { type: "background", id: "charlatan" },
                "pt-BR"
            )
        ).toContain("segunda identidade");
    });

    it("returns curated hermit feature description in English", () => {
        expect(
            getAbilityFeatureDescription("Discovery", {
                type: "background",
                id: "hermit",
            })
        ).toContain("settled world still argues");
    });

    it("returns localized hermit feature description for pt-BR", () => {
        expect(
            getAbilityFeatureDescription(
                "Discovery",
                { type: "background", id: "hermit" },
                "pt-BR"
            )
        ).toContain("mundo povoado");
    });

    it("returns curated system combat descriptions", () => {
        expect(
            getAbilityFeatureDescription("Dash", {
                type: "system",
                id: "dnd-basic-combat",
            })
        ).toContain("extra movement");
        expect(
            getAbilityFeatureDescription(
                "Opportunity Attack",
                { type: "system", id: "dnd-basic-combat" },
                "pt-BR"
            )
        ).toContain("reação");
    });

    it("returns localized feature names", () => {
        expect(getAbilityFeatureName("Dash")).toBe("Dash");
        expect(getAbilityFeatureName("Dash", "pt-BR")).toBe("Disparada");
        expect(getAbilityFeatureName("Opportunity Attack", "pt-BR")).toBe(
            "Ataque de oportunidade"
        );
    });
});
