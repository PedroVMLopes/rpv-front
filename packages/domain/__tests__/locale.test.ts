import {
    DEFAULT_LOCALE,
    isLocale,
    resolveLocalized,
    type Localized,
} from "../src/i18n/locale";

describe("locale primitives", () => {
    describe("isLocale", () => {
        it("accepts supported locales", () => {
            expect(isLocale("en")).toBe(true);
            expect(isLocale("pt-BR")).toBe(true);
        });

        it("rejects unknown or non-string values", () => {
            expect(isLocale("fr")).toBe(false);
            expect(isLocale("pt")).toBe(false);
            expect(isLocale(undefined)).toBe(false);
            expect(isLocale(42)).toBe(false);
        });
    });

    describe("resolveLocalized", () => {
        const value: Localized<string> = {
            en: "Fireball",
            "pt-BR": "Bola de Fogo",
        };

        it("returns the requested locale when present", () => {
            expect(resolveLocalized(value, "pt-BR")).toBe("Bola de Fogo");
            expect(resolveLocalized(value, "en")).toBe("Fireball");
        });

        it("falls back to the default locale when the request is missing", () => {
            const partial: Localized<string> = { en: "Fireball" };
            expect(resolveLocalized(partial, "pt-BR")).toBe("Fireball");
        });

        it("falls back to any populated locale when the default is missing", () => {
            const ptOnly: Localized<string> = { "pt-BR": "Bola de Fogo" };
            expect(resolveLocalized(ptOnly, "en")).toBe("Bola de Fogo");
        });

        it("returns undefined for empty or missing maps", () => {
            expect(resolveLocalized(undefined, "en")).toBeUndefined();
            expect(resolveLocalized({}, "en")).toBeUndefined();
        });

        it("uses English as the default fallback locale", () => {
            expect(DEFAULT_LOCALE).toBe("en");
        });
    });
});
