import { z } from "zod";

export function createDynamicSchema(presetSchema: any, type: "player" | "enemy" | "npc") {
  return z.object({
    ...presetSchema.common,
    ...(presetSchema[type] || {})
  });
}
