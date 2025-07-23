import { z } from "zod";

export const commonFieldsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["player", "enemy", "npc"]),
  hp: z.number().optional(),
  maxHp: z.number().optional(),
  ac: z.number().optional(),
  initiative: z.number().optional(),

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
    .optional()
    .default([
      { name: "strength", value: 10 },
      { name: "dexterity", value: 10 },
      { name: "constitution", value: 10 },
      { name: "intelligence", value: 10 },
      { name: "wisdom", value: 10 },
      { name: "charisma", value: 10 },
    ]).optional(),
})

export const playerFieldsSchema = z.object({
  level: z.number().optional(),
  class: z.string().optional(),
  subclass: z.string().optional(),
})

export const enemyFieldsSchema = z.object({
  creatureType: z.string().optional(),
  cr: z.number().optional(),
  notes: z.string().optional(),
})

export const npcFieldsSchema = z.object({
  job: z.string().optional(),
})

export const characterSchemasByType = {
  player: commonFieldsSchema.extend(playerFieldsSchema.shape),
  enemy: commonFieldsSchema.extend(enemyFieldsSchema.shape),
  npc: commonFieldsSchema.extend(npcFieldsSchema.shape),
};