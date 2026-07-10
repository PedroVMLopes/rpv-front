/**
 * Consumable item cards will be implemented here in a follow-up phase.
 * Weapon cards use `buildWeaponContentModel` instead.
 * Roll button labels should use `formatRollButtonLabel`:
 * - attack_then_damage: `{ primary: "d20", modifier: attackModifier }`
 * - damage-only rolls: `{ primary: damageDice, modifier: damageFlat }`
 */
export function buildItemContentModel(): never {
    throw new Error("buildItemContentModel is not implemented yet");
}
