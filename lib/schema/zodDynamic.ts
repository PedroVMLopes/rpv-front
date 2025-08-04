import { z, ZodObject } from "zod";

export function createDynamicSchema(
  presetSchema: Record<string, ZodObject<any>>,
  type: "player" | "enemy" | "npc"
) {
  const commonSchema = presetSchema.common;
  const typeSchema = presetSchema[type];

  if (!commonSchema) {
    throw new Error(`Common schema is missing`);
  }
  if (!typeSchema) {
    throw new Error(`Schema for type "${type}" not found`);
  }

  return commonSchema.extend(typeSchema.shape);
}
