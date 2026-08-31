import { z } from "zod";
import { createDynamicSchema } from "../lib/schema/zodDynamic";

describe("createDynamicSchema", () => {
    it("throws when the common schema is missing", () => {
        expect(() =>
            createDynamicSchema(
                { player: z.object({ name: z.string() }) },
                "player"
            )
        ).toThrow("Common schema is missing");
    });

    it("throws when the requested type schema is missing", () => {
        expect(() =>
            createDynamicSchema({ common: z.object({ name: z.string() }) }, "npc")
        ).toThrow('Schema for type "npc" not found');
    });

    it("extends common fields with the type schema", () => {
        const schema = createDynamicSchema(
            {
                common: z.object({ name: z.string() }),
                player: z.object({ level: z.number() }),
            },
            "player"
        );

        expect(schema.safeParse({ name: "Hero", level: 3 }).success).toBe(true);
        expect(schema.safeParse({ name: "Hero" }).success).toBe(false);
    });
});
