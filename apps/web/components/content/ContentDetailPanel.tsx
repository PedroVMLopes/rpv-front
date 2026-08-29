"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";

export type ContentDetailQuantityHandlers = {
    onAdjustQuantity?: (delta: -1 | 1) => void;
    canIncrementQuantity?: boolean;
    canDecrementQuantity?: boolean;
    decreaseLabel?: string;
    increaseLabel?: string;
};

type ContentDetailPanelProps = {
    model: ContentDetailModel;
    quantityHandlers?: ContentDetailQuantityHandlers;
};

export function ContentDetailPanel({
    model,
    quantityHandlers,
}: ContentDetailPanelProps) {
    const t = useTranslations("contentDetail");

    return (
        <div className="flex flex-col gap-4">
            {model.shortDescription ? (
                <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                        {t("summary")}
                    </p>
                    <p className="text-sm leading-relaxed">
                        {model.shortDescription}
                    </p>
                </div>
            ) : null}

            {model.sections.map((section, sectionIndex) => (
                <dl
                    key={`section-${sectionIndex}`}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                    {section.rows.map((row) => (
                        <div
                            key={row.labelKey}
                            className={`flex flex-col gap-0.5 text-sm ${
                                row.fullWidth ? "sm:col-span-2" : ""
                            }`}
                        >
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <span>{t(`fields.${row.labelKey}`)}</span>
                                {row.quantityControls &&
                                quantityHandlers?.onAdjustQuantity ? (
                                    <span className="flex shrink-0 items-center gap-0.5 border rounded-md border-border/15">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="size-5 px-0"
                                            aria-label={
                                                quantityHandlers.decreaseLabel
                                            }
                                            disabled={
                                                quantityHandlers.canDecrementQuantity ===
                                                false
                                            }
                                            onClick={() =>
                                                quantityHandlers.onAdjustQuantity?.(
                                                    -1
                                                )
                                            }
                                        >
                                            −
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="size-5 px-0"
                                            aria-label={
                                                quantityHandlers.increaseLabel
                                            }
                                            disabled={
                                                quantityHandlers.canIncrementQuantity ===
                                                false
                                            }
                                            onClick={() =>
                                                quantityHandlers.onAdjustQuantity?.(
                                                    1
                                                )
                                            }
                                        >
                                            +
                                        </Button>
                                    </span>
                                ) : null}
                            </dt>
                            <dd className="font-medium whitespace-pre-line">{row.value}</dd>
                        </div>
                    ))}
                </dl>
            ))}

            {model.description ? (
                <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                        {t("description")}
                    </p>
                    <p className="text-sm leading-relaxed">{model.description}</p>
                </div>
            ) : null}

            {model.higherLevel ? (
                <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                        {t("higherLevel")}
                    </p>
                    <p className="text-sm leading-relaxed">{model.higherLevel}</p>
                </div>
            ) : null}

            {model.source ? (
                <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                        {t("fields.source")}
                    </p>
                    <p className="text-sm leading-relaxed">{model.source}</p>
                </div>
            ) : null}
        </div>
    );
}
