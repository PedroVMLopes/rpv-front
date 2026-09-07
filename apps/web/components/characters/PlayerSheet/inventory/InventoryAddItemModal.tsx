"use client";

import { useEffect, useMemo, useState } from "react";
import type { ItemEntry } from "@rpv/content";
import { listItems } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SystemKey } from "@/presets";
import { useCharacterStore } from "@/store/useCharacterStore";
import { cn } from "@/lib/utils";
import { sheetInset } from "../playerSheetSurfaces";

type InventoryAddItemModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    system: SystemKey;
    characterId: string;
    locale: Locale;
};

type CatalogCategory = {
    key: string;
    label: string;
};

function collectCatalogCategories(items: ItemEntry[]): CatalogCategory[] {
    const byKey = new Map<string, string>();
    for (const item of items) {
        const key = item.category?.key;
        if (!key || byKey.has(key)) {
            continue;
        }
        byKey.set(key, item.category.name || key);
    }
    return Array.from(byKey.entries())
        .map(([key, label]) => ({ key, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

function matchesCatalogQuery(item: ItemEntry, query: string): boolean {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
        return true;
    }
    if (item.slug.toLowerCase().includes(normalized)) {
        return true;
    }
    return item.name.toLowerCase().includes(normalized);
}

export function InventoryAddItemModal({
    open,
    onOpenChange,
    system,
    characterId,
    locale,
}: InventoryAddItemModalProps) {
    const t = useTranslations("playerSheet.inventory");
    const addToBag = useCharacterStore((state) => state.addToBag);

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryKey, setCategoryKey] = useState<string>("all");
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setSearchQuery("");
            setCategoryKey("all");
            setSelectedSlug(null);
        }
    }, [open]);

    const catalogItems = useMemo(() => {
        if (!open) {
            return [] as ItemEntry[];
        }
        return listItems(system, locale);
    }, [open, system, locale]);

    const categories = useMemo(
        () => collectCatalogCategories(catalogItems),
        [catalogItems]
    );

    const filteredItems = useMemo(() => {
        return catalogItems.filter((item) => {
            if (categoryKey !== "all" && item.category?.key !== categoryKey) {
                return false;
            }
            return matchesCatalogQuery(item, searchQuery);
        });
    }, [catalogItems, categoryKey, searchQuery]);

    function handleConfirm() {
        if (!selectedSlug) {
            return;
        }
        addToBag(characterId, selectedSlug, 1);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        {t("addItemTitle")}
                    </DialogTitle>
                    <DialogDescription>{t("addItemDescription")}</DialogDescription>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col gap-3 py-3">
                    <Input
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={t("addItemSearchPlaceholder")}
                        aria-label={t("addItemSearchPlaceholder")}
                    />

                    <div
                        className={cn(
                            "flex flex-wrap gap-1 rounded-xl p-1",
                            sheetInset
                        )}
                        role="tablist"
                        aria-label={t("addItemCategoryNavLabel")}
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={categoryKey === "all"}
                            className={cn(
                                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                                categoryKey === "all"
                                    ? "border border-card-foreground/10 bg-card text-card-foreground shadow-sm"
                                    : "text-card-foreground/60 hover:text-card-foreground"
                            )}
                            onClick={() => setCategoryKey("all")}
                        >
                            {t("addItemCategoryAll")}
                        </button>
                        {categories.map((category) => {
                            const selected = categoryKey === category.key;
                            return (
                                <button
                                    key={category.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    className={cn(
                                        "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                                        selected
                                            ? "border border-card-foreground/10 bg-card text-card-foreground shadow-sm"
                                            : "text-card-foreground/60 hover:text-card-foreground"
                                    )}
                                    onClick={() => setCategoryKey(category.key)}
                                >
                                    {category.label}
                                </button>
                            );
                        })}
                    </div>

                    <div
                        className={cn(
                            "min-h-0 flex-1 overflow-y-auto rounded-xl border",
                            sheetInset
                        )}
                        role="listbox"
                        aria-label={t("addItemTitle")}
                    >
                        {catalogItems.length === 0 ? (
                            <p className="p-4 text-center text-sm text-muted-foreground">
                                {t("addItemEmpty")}
                            </p>
                        ) : filteredItems.length === 0 ? (
                            <p className="p-4 text-center text-sm text-muted-foreground">
                                {t("addItemNoMatch")}
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {filteredItems.map((item) => {
                                    const selected = selectedSlug === item.slug;
                                    return (
                                        <li key={item.slug}>
                                            <button
                                                type="button"
                                                role="option"
                                                aria-selected={selected}
                                                className={cn(
                                                    "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                                                    selected
                                                        ? "bg-primary/10 text-foreground"
                                                        : "hover:bg-muted/60"
                                                )}
                                                onClick={() =>
                                                    setSelectedSlug(item.slug)
                                                }
                                            >
                                                <span className="min-w-0 truncate font-medium">
                                                    {item.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0"
                                                >
                                                    {item.category.name}
                                                </Badge>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {t("addItemCancel")}
                    </Button>
                    <Button
                        type="button"
                        disabled={!selectedSlug}
                        onClick={handleConfirm}
                    >
                        {t("addItemConfirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
