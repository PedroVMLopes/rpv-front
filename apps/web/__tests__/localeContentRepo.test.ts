import { contentRepo } from "../lib/content/contentRepository";

describe("content locale resolution", () => {
    it("getClass returns default name without locale, localized with pt-BR", () => {
        expect(contentRepo().getClass("fighter")?.name).toBe("Fighter");
        expect(contentRepo().getClass("fighter", "pt-BR")?.name).toBe("Guerreiro");
    });

    it("getItem returns default name without locale, localized with pt-BR", () => {
        expect(contentRepo("dnd").getItem("longsword")?.name).toBe("Longsword");
        expect(contentRepo("dnd").getItem("longsword", "pt-BR")?.name).toBe(
            "Espada Longa"
        );
    });

    it("getClassHitDie is unchanged regardless of locale", () => {
        expect(contentRepo().getClass("fighter")?.hitDie).toBe(10);
        expect(contentRepo().getClass("fighter", "pt-BR")?.hitDie).toBe(10);
    });
});
