"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PlayerSheet } from "@/components/characters/PlayerSheet/PlayerSheet";
import { Button } from "@/components/ui/button";
import { useCharacterStore } from "@/store/useCharacterStore";

export default function PlayerSheetPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const t = useTranslations("playerSheet");
    const stored = useCharacterStore((state) =>
        state.characters.find((character) => character.id === id)
    );

    if (!id || !stored || stored.type !== "player") {
        return (
            <div className="flex flex-col items-start gap-4 p-4">
                <p className="text-muted-foreground">{t("notFound")}</p>
                <Button asChild variant="outline">
                    <Link href="/characters/player">{t("backToList")}</Link>
                </Button>
            </div>
        );
    }

    return <PlayerSheet stored={stored} />;
}
