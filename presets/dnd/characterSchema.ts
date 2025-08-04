import { z } from "zod";

export const dndCharacterSchema = {
  common: {
    name: z.string().min(1, "Name is required"),
    hp: z.coerce.number().optional(),
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
  },
  player: {
    level: z.coerce.number().optional(),
    characterClass: z.string().optional()
  },
  enemy: {
    creatureType: z.string().optional(),
    cr: z.coerce.number().optional()
  },
  npc: {
    job: z.string().optional()
  }
};
