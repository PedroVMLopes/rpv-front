import { dndCharacterFields } from "./characterFields";
import { dndCharacterSchema } from "./characterSchema";
import { dndStatConfig } from "./characterStats";

export const dndPreset = {
  id: "dnd",
  name: "Dungeons & Dragons",
  characters: {
    fields: dndCharacterFields,
    schema: dndCharacterSchema
  },
  statConfig: dndStatConfig,
};
