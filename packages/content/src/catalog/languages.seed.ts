import type { Language } from "./catalog.types";

export const dndLanguages: Language[] = [
    { slug: "common", name: "Common", type: "standard", script: "Common" },
    { slug: "dwarvish", name: "Dwarvish", type: "standard", script: "Dwarvish" },
    { slug: "elvish", name: "Elvish", type: "standard", script: "Elvish" },
    { slug: "giant", name: "Giant", type: "standard", script: "Dwarvish" },
    { slug: "gnomish", name: "Gnomish", type: "standard", script: "Dwarvish" },
    { slug: "goblin", name: "Goblin", type: "standard", script: "Dwarvish" },
    { slug: "halfling", name: "Halfling", type: "standard", script: "Common" },
    { slug: "orc", name: "Orc", type: "standard", script: "Dwarvish" },
    { slug: "abyssal", name: "Abyssal", type: "exotic", script: "Infernal" },
    { slug: "celestial", name: "Celestial", type: "exotic", script: "Celestial" },
    { slug: "deep-speech", name: "Deep Speech", type: "exotic" },
    { slug: "draconic", name: "Draconic", type: "exotic", script: "Draconic" },
    { slug: "infernal", name: "Infernal", type: "exotic", script: "Infernal" },
    { slug: "primordial", name: "Primordial", type: "exotic", script: "Dwarvish" },
    { slug: "sylvan", name: "Sylvan", type: "exotic", script: "Elvish" },
    { slug: "undercommon", name: "Undercommon", type: "exotic", script: "Elvish" },
];
