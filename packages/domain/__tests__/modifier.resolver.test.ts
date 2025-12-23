import { resolveStats } from "../src";
import { Modifier } from "../src";

const baseStats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  armorClass: 10,
  hitPoints: 10
};

describe("resolveStats", () => {
  it("applies add modifiers correctly", () => {
    const modifiers: Modifier[] = [
      {
        stat: "strength",
        operation: "add",
        value: 2,
        source: { type: "race", id: "elf" }
      }
    ];

    const result = resolveStats(baseStats, modifiers);

    expect(result.strength).toBe(12);
  });
});
