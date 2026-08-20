import type {
    ContentDetailModel,
    ContentSummaryModel,
    ContentUseActionSpec,
} from "./contentDetail.types";

export type FeatureContentModels = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
};

export type BuildFeatureContentModelInput = {
    id: string;
    title: string;
    description?: string;
    sourceLabel: string;
    costLabel?: string;
    resourceLabel?: string;
    useLabel?: string;
    depleted?: boolean;
};

function firstParagraph(description: string | undefined): string | undefined {
    if (!description) {
        return undefined;
    }

    const paragraph = description.trim().split(/\n\s*\n/)[0]?.trim();
    return paragraph || undefined;
}

export function buildFeatureContentModel(
    input: BuildFeatureContentModelInput
): FeatureContentModels {
    const shortDescription = firstParagraph(input.description);
    const useAction: ContentUseActionSpec | undefined = input.useLabel
        ? {
              kind: "cast",
              label: input.useLabel,
              disabled: Boolean(input.depleted),
          }
        : undefined;
    const badges = [
        ...(input.costLabel
            ? [{ label: input.costLabel, variant: "muted" as const }]
            : []),
        ...(input.resourceLabel
            ? [{ label: input.resourceLabel, variant: "muted" as const }]
            : []),
    ];

    return {
        summary: {
            id: input.id,
            kind: "feature",
            title: input.title,
            badges,
            shortDescription,
            useAction,
        },
        detail: {
            id: input.id,
            kind: "feature",
            title: input.title,
            description: input.description,
            sections: [
                {
                    rows: [{ labelKey: "source", value: input.sourceLabel }],
                },
            ],
            useAction,
        },
    };
}
