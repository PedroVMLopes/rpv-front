import { dndCharacterFields } from "./characterFields"; 
import { dndCharacterSchema } from "./characterSchema";

export const dndPreset = {
  id: "dnd",
  name: "Dungeons & Dragons",
  characters: {
    fields: dndCharacterFields,
    schema: dndCharacterSchema
  }
};
