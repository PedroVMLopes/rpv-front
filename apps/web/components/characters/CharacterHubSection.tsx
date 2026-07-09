"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FaGlobe, FaList, FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export type CharacterHubType = "player" | "enemy" | "npc";

interface CharacterHubSectionProps {
    type: CharacterHubType;
}

export function CharacterHubSection({ type }: CharacterHubSectionProps) {
    const t = useTranslations("characterHub");
    const typeTitle = t(`${type}.title`);

    return (
        <Card className="gap-4 py-4 font-bold font-serif">
            <CardHeader className="px-4 pb-0">
                <CardTitle className="text-base">
                    {typeTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
                <div className="flex items-center gap-2">
                    <Button
                        asChild
                        variant="default"
                        className="flex-1"
                    >
                        <Link href={`/characters/${type}`}>
                            {t(`${type}.yourList`)}
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="default"
                        size="icon"
                        aria-label={t("create", { type: typeTitle })}
                    >
                        <Link href={`/characters/${type}/create`}>
                            <FaPlus />
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled
                        aria-label={t("exploreCommunity")}
                    >
                        <FaGlobe />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
