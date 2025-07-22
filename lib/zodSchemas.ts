import { z } from "zod";

export const characterSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["player", "enemy", "npc"]),
  hp: z.coerce.number().min(0),
  maxHp: z.coerce.number().min(1),
  ac: z.coerce.number().optional(),
  initiative: z.coerce.number().optional(),

  // Optional Fields  
  class: z.string().optional(),
  level: z.coerce.number().optional(),
  creatureType: z.string().optional(),
  cr: z.coerce.number().optional(),
  notes: z.string().optional(),
});