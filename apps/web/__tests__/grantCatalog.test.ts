import { listSubclassOptions } from "../lib/catalog/grantCatalog";

describe("grantCatalog subclass options", () => {
    it("returns namespaced subclass options for a class", () => {
        expect(listSubclassOptions("fighter", "en")).toEqual([
            { value: "fighter-champion", label: "Champion" },
        ]);
        expect(listSubclassOptions("wizard", "en")).toEqual([
            { value: "wizard-evocation", label: "Evocation" },
        ]);
    });

    it("returns empty options when class slug is missing or unknown", () => {
        expect(listSubclassOptions(undefined)).toEqual([]);
        expect(listSubclassOptions("unknown")).toEqual([]);
    });

    it("applies pt-BR content locale labels", () => {
        expect(listSubclassOptions("fighter", "pt-BR")).toEqual([
            { value: "fighter-champion", label: "Campeão" },
        ]);
    });
});
