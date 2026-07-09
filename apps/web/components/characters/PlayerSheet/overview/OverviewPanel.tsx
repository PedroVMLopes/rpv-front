import type { ComponentProps } from "react";
import { SheetPanel } from "@/components/characters/SheetPanel";

type OverviewPanelProps = Omit<ComponentProps<typeof SheetPanel>, "variant">;

export function OverviewPanel(props: OverviewPanelProps) {
    return <SheetPanel variant="nested" {...props} />;
}
