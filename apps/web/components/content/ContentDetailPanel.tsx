"use client";

import { useTranslations } from "next-intl";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";

type ContentDetailPanelProps = {
    model: ContentDetailModel;
};

export function ContentDetailPanel({ model }: ContentDetailPanelProps) {
    const t = useTranslations("contentDetail");

    return (
        <div className="flex flex-col gap-4">
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
                            <dt className="text-muted-foreground">
                                {t(`fields.${row.labelKey}`)}
                            </dt>
                            <dd className="font-medium">{row.value}</dd>
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
        </div>
    );
}
