import { z } from "zod";

export const dndCharacterSchema = {
  common: z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["player", "enemy", "npc"]).optional(),
    system: z.string().optional(),
    hp: z.coerce.number().optional().default(0),
    maxHp: z.coerce.number().optional(),
    ac: z.coerce.number().optional(),
    initiative: z.coerce.number().optional(),

    attributes: z
    .array(
      z.object({
        name: z.enum([
          "strength",
          "dexterity",
          "constitution",
          "intelligence",
          "wisdom",
          "charisma",
        ]),
        value: z.number().min(0).max(20).default(10).optional(),
      })
    )
    .default([
      { name: "strength", value: 10 },
      { name: "dexterity", value: 10 },
      { name: "constitution", value: 10 },
      { name: "intelligence", value: 10 },
      { name: "wisdom", value: 10 },
      { name: "charisma", value: 10 },
    ]).optional(),
  }),
  player: z.object({
    level: z.coerce.number().optional(),
    characterClass: z.string().optional()
  }),
  enemy: z.object({
    creatureType: z.string().optional(),
    cr: z.coerce.number().optional()
  }),
  npc: z.object({
    job: z.string().optional()
  })
};

export const characterSchemasByType = {
  player: dndCharacterSchema.common.extend(dndCharacterSchema.player.shape),
  enemy: dndCharacterSchema.common.extend(dndCharacterSchema.enemy.shape),
  npc: dndCharacterSchema.common.extend(dndCharacterSchema.npc.shape)
}