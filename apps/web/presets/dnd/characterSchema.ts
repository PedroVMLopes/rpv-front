import { z } from "zod";
import {
    dndAbilityAttributeNames,
    dndDefaultAttributes,
} from "./characterStats";

export const dndCharacterSchema = {
  common: z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["player", "enemy", "npc"]).optional(),
    system: z.enum(["dnd", "op", "coc"]).optional(),
    hp: z.coerce.number().optional().default(0),
    maxHp: z.coerce.number().optional(),
    ac: z.coerce.number().optional(),
    initiative: z.coerce.number().optional(),

    attributes: z
    .array(
      z.object({
        name: z.enum(dndAbilityAttributeNames),
        value: z.number().min(0).max(20).default(10).optional(),
      })
    )
    .default(dndDefaultAttributes).optional(),
  }),
  player: z.object({
    level: z.coerce.number().min(1).max(20).optional().default(1),
    characterClass: z.string().optional(),
    subclass: z.string().optional(),
    race: z.string().optional(),
    subrace: z.string().optional(),
    background: z.string().optional(),
    startingItem: z.string().optional(),
    choices: z
      .object({
        grantPicks: z.record(z.string(), z.string()).optional(),
      })
      .optional(),
    abilityScoreMethod: z
      .enum(["manual", "standard-array", "point-buy", "roll"])
      .optional(),
    abilityScoreRolls: z.array(z.coerce.number()).optional(),
  }),
  enemy: z.object({
    creatureType: z.string().optional(),
    cr: z.coerce.number().optional()
  }),
  npc: z.object({
    occupation: z.string().optional()
  })
};

export const characterSchemasByType = {
  player: dndCharacterSchema.common.extend(dndCharacterSchema.player.shape),
  enemy: dndCharacterSchema.common.extend(dndCharacterSchema.enemy.shape),
  npc: dndCharacterSchema.common.extend(dndCharacterSchema.npc.shape)
}