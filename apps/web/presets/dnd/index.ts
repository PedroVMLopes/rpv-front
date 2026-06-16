import type { SystemDefinition } from "../types";
import { dndCharacterFields } from "./characterFields";
import { dndCharacterSchema } from "./characterSchema";
import { dndStatConfig } from "./characterStats";
import { dndRules } from "./rules";

export const dndPreset = {
    id: "dnd",
    name: "Dungeons & Dragons",
    characters: {
        fields: dndCharacterFields,
        schema: dndCharacterSchema,
    },
    statConfig: dndStatConfig,
    rules: dndRules,
} satisfies SystemDefinition;
