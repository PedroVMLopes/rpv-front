/**
 * @jest-environment jsdom
 */
import { useContentLocale } from "../store/useContentLocale";

describe("useContentLocale store", () => {
    beforeEach(() => {
        useContentLocale.setState({ contentLocale: "en" });
    });

    it("defaults the content language to English", () => {
        expect(useContentLocale.getState().contentLocale).toBe("en");
    });

    it("updates the content language independently of the UI", () => {
        useContentLocale.getState().setContentLocale("pt-BR");
        expect(useContentLocale.getState().contentLocale).toBe("pt-BR");
    });
});
