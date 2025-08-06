import z from "zod";
import { dndPreset } from "./dnd";

export const presets = {
  dnd: {
    name: "Dungeons & Dragons",
    presetData: dndPreset,
  },
};

export type SystemKey = keyof typeof presets;