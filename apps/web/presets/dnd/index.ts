import { dndCharacterFields } from "./characterFields";
import { dndCharacterSchema } from "./characterSchema";
import { dndStatConfig } from "./characterStats";
import { dndHpRules } from "./hp";

export const dndPreset = {
  id: "dnd",
  name: "Dungeons & Dragons",
  characters: {
    fields: dndCharacterFields,
    schema: dndCharacterSchema
  },
  statConfig: dndStatConfig,
  hpRules: dndHpRules,
};
