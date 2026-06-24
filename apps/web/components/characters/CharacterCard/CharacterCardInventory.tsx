"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { CharacterInventory } from "@rpv/domain";
import {
    canEquipItem,
    getEquipmentSlots,
    getItem,
    listItems,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { CarouselItem } from "@/components/ui/characterCarousel";
import { Button } from "@/components/ui/button";
import { bagStackReactKey } from "@/lib/character/inventory";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";

interface CharacterCardInventoryProps {
    characterId: string;
}

function getBagQuantity(
    bag: CharacterInventory["bag"],
    slug: string
): number {
    return bag.find((stack) => stack.slug === slug)?.quantity ?? 0;
}

function isEquippedElsewhere(
    equipped: CharacterInventory["equipped"],
    slug: string,
    exceptSlotId: string
): boolean {
    return Object.entries(equipped).some(
        ([slotId, equippedSlug]) => slotId !== exceptSlotId && equippedSlug === slug
    );
}

function equippableBagSlugs(
    bag: CharacterInventory["bag"],
    slotId: string,
    system: SystemKey,
    equipped: CharacterInventory["equipped"]
): string[] {
    const slugs = new Set<string>();

    for (const stack of bag) {
        if (
            stack.quantity > 0 &&
            canEquipItem(stack.slug, slotId, system) &&
            !isEquippedElsewhere(equipped, stack.slug, slotId)
        ) {
            slugs.add(stack.slug);
        }
    }

    return Array.from(slugs);
}

function itemDisplayName(
    slug: string,
    system: SystemKey,
    contentLocale: ReturnType<typeof useContentLocale.getState>["contentLocale"]
): string {
    return getItem(slug, system, contentLocale)?.name ?? slug;
}

function SlotRow({
    characterId,
    slotId,
    labelKey,
    system,
    inventory,
    contentLocale,
}: {
    characterId: string;
    slotId: string;
    labelKey: string;
    system: SystemKey;
    inventory: CharacterInventory;
    contentLocale: ReturnType<typeof useContentLocale.getState>["contentLocale"];
}) {
    const t = useTranslations();
    const tInventory = useTranslations("inventory");
    const equipItem = useCharacterStore((state) => state.equipItem);
    const unequipItem = useCharacterStore((state) => state.unequipItem);

    const equippedSlug = inventory.equipped[slotId];
    const options = useMemo(
        () => equippableBagSlugs(inventory.bag, slotId, system, inventory.equipped),
        [inventory.bag, inventory.equipped, slotId, system]
    );

    const [selectedSlug, setSelectedSlug] = useState("");

    const slotLabel = t(labelKey);
    const canEquip =
        !equippedSlug &&
        selectedSlug.length > 0 &&
        getBagQuantity(inventory.bag, selectedSlug) > 0;

    return (
        <li className="flex flex-col gap-1 rounded-lg border px-2 py-1.5 bg-popover text-sm">
            <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{slotLabel}</span>
                {equippedSlug ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label={`${tInventory("unequip")} ${slotLabel}`}
                        onClick={() => unequipItem(characterId, slotId)}
                    >
                        {tInventory("unequip")}
                    </Button>
                ) : null}
            </div>
            {equippedSlug ? (
                <span className="text-muted-foreground">
                    {itemDisplayName(equippedSlug, system, contentLocale)}
                </span>
            ) : (
                <div className="flex flex-row gap-1 items-center">
                    <select
                        className="flex-1 min-w-0 rounded-md border bg-background px-2 py-1 text-sm"
                        value={selectedSlug}
                        onChange={(event) => setSelectedSlug(event.target.value)}
                        aria-label={tInventory("equipToSlot", { slot: slotLabel })}
                    >
                        <option value="">{tInventory("selectItem")}</option>
                        {options.map((slug) => (
                            <option key={slug} value={slug}>
                                {itemDisplayName(slug, system, contentLocale)}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={!canEquip}
                        aria-label={`${tInventory("equip")} ${slotLabel}`}
                        onClick={() => {
                            if (!canEquip) return;
                            equipItem(characterId, slotId, selectedSlug);
                            setSelectedSlug("");
                        }}
                    >
                        {tInventory("equip")}
                    </Button>
                </div>
            )}
            {!equippedSlug && options.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                    {tInventory("emptySlot")}
                </span>
            ) : null}
        </li>
    );
}

export default function CharacterCardInventory({
    characterId,
}: CharacterCardInventoryProps) {
    const t = useTranslations();
    const tInventory = useTranslations("inventory");
    const contentLocale = useContentLocale((state) => state.contentLocale);

    const stored = useCharacterStore((state) =>
        state.characters.find((character) => character.id === characterId)
    );
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const addToBag = useCharacterStore((state) => state.addToBag);
    const removeFromBag = useCharacterStore((state) => state.removeFromBag);

    const [addSlug, setAddSlug] = useState("");

    const catalogItems = useMemo(() => {
        if (!stored) return [];
        return listItems(stored.system, contentLocale);
    }, [stored, contentLocale]);

    if (!stored) {
        return (
            <CarouselItem>
                <div className="flex flex-col rounded-2xl p-2 px-3 border my-2 text-muted-foreground text-sm">
                    {t("character.noneSelected")}
                </div>
            </CarouselItem>
        );
    }

    const inventory = stored.selections.inventory;
    const resolved = getResolvedStats(characterId);
    const slots = getEquipmentSlots(stored.system);

    return (
        <CarouselItem>
            <div className="flex flex-col rounded-2xl p-2 px-3 border my-2 gap-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="border rounded-lg p-2 bg-popover">
                        <span className="text-muted-foreground">
                            {tInventory("resolvedMaxHp", {
                                value: resolved?.hitPoints ?? 0,
                            })}
                        </span>
                    </div>
                    <div className="border rounded-lg p-2 bg-popover">
                        <span className="text-muted-foreground">
                            {tInventory("resolvedAc", {
                                value: resolved?.armorClass ?? 0,
                            })}
                        </span>
                    </div>
                </div>

                <section>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        {tInventory("bag")}
                    </p>
                    <div className="flex flex-row gap-1 mb-2">
                        <select
                            className="flex-1 min-w-0 rounded-md border bg-background px-2 py-1 text-sm"
                            value={addSlug}
                            onChange={(event) => setAddSlug(event.target.value)}
                            aria-label={tInventory("selectItem")}
                        >
                            <option value="">{tInventory("selectItem")}</option>
                            {catalogItems.map((item) => (
                                <option key={item.slug} value={item.slug}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={!addSlug}
                            onClick={() => {
                                if (!addSlug) return;
                                addToBag(characterId, addSlug);
                                setAddSlug("");
                            }}
                        >
                            {tInventory("addItem")}
                        </Button>
                    </div>
                    {inventory.bag.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            {tInventory("emptyBag")}
                        </p>
                    ) : (
                        <ul className="space-y-1 text-sm">
                            {inventory.bag.map((stack) => (
                                <li
                                    key={bagStackReactKey(stack)}
                                    className="flex items-center justify-between rounded-lg border px-2 py-1 bg-popover"
                                >
                                    <span>
                                        {itemDisplayName(
                                            stack.slug,
                                            stored.system,
                                            contentLocale
                                        )}{" "}
                                        <span className="text-muted-foreground">
                                            {tInventory("quantity", {
                                                count: stack.quantity,
                                            })}
                                        </span>
                                    </span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            removeFromBag(
                                                characterId,
                                                stack.slug,
                                                1
                                            )
                                        }
                                    >
                                        {tInventory("remove")}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        {tInventory("equipment")}
                    </p>
                    <ul className="space-y-2">
                        {slots.map((slot) => (
                            <SlotRow
                                key={slot.id}
                                characterId={characterId}
                                slotId={slot.id}
                                labelKey={slot.labelKey}
                                system={stored.system}
                                inventory={inventory}
                                contentLocale={contentLocale}
                            />
                        ))}
                    </ul>
                </section>
            </div>
        </CarouselItem>
    );
}
