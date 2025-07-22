import { z } from "zod";

export const characterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["player", "enemy", "npc"]),
  hp: z.number().min(0),
  maxHp: z.number().min(1),
  ac: z.number().optional(),
  initiative: z.number().optional(),
  // Optional Fields  
  class: z.string().optional(),
  level: z.number().optional(),
  creatureType: z.string().optional(),
  cr: z.number().optional(),
  notes: z.string().optional(),
});

export type CharacterFormData = z.infer<typeof characterSchema>;