"use client";

import * as React from "react";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/characterCarousel";
import { cn } from "@/lib/utils";
import { useCharacterStore } from "@/store/useCharacterStore";
import CharacterCardInfoBlocks from "./CharacterCardInfoBlocks";
import CharacterCardGameInfo from "./CharacterCardGameInfo";
import CharacterCardAbilities from "./CharacterCardAbilities";
import CharacterCardInventory from "./CharacterCardInventory";
import {
    CharacterPortrait,
    CharacterTitle,
    getAvatarUrl,
    getCarouselPageName,
} from "./characterCardUi";

const HP_RESOURCE = "hp";

const carouselControlClassName =
    "static top-auto right-auto left-auto size-8 shrink-0 translate-x-0 translate-y-0";

type CharacterCardExpandedDialogProps = {
    characterId: string;
    stored: StoredCharacter;
    trigger: React.ReactNode;
};

export default function CharacterCardExpandedDialog({
    characterId,
    stored,
    trigger,
}: CharacterCardExpandedDialogProps) {
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved = getResolvedStats(characterId);

    const [api, setApi] = React.useState<CarouselApi>();
    const [pageName, setPageName] = React.useState(getCarouselPageName(0));

    React.useEffect(() => {
        if (!api) {
            return;
        }

        const updatePage = () => {
            setPageName(getCarouselPageName(api.selectedScrollSnap()));
        };

        updatePage();
        api.on("select", updatePage);
    }, [api]);

    const systemData = stored.systemData;
    const avatarUrl = getAvatarUrl(systemData);
    const currentHp = stored.resources[HP_RESOURCE] ?? 0;
    const maxHp = resolved?.hitPoints ?? 0;
    const ac = resolved?.armorClass ?? 0;

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent
                data-testid="character-expanded-dialog"
                className={cn(
                    "flex h-[90dvh] max-h-[90dvh] min-h-0 w-[calc(100vw-1rem)] min-w-0 max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0",
                    "sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
                )}
            >
                <DialogHeader className="shrink-0 px-4 pt-4 pr-12 text-left">
                    <DialogTitle className="truncate text-lg font-bold">
                        <CharacterTitle
                            name={stored.name}
                            level={systemData.level}
                        />
                    </DialogTitle>
                </DialogHeader>

                {avatarUrl ? (
                    <div className="shrink-0 px-4">
                        <CharacterPortrait
                            avatarUrl={avatarUrl}
                            name={stored.name}
                            currentHp={currentHp}
                            maxHp={maxHp}
                            ac={ac}
                            className="relative w-full overflow-hidden rounded-2xl"
                        />
                    </div>
                ) : null}

                <Carousel
                    className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden"
                    setApi={setApi}
                    opts={{ loop: true }}
                >
                    <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
                        <CarouselPrevious
                            className={carouselControlClassName}
                        />
                        <p className="min-w-0 flex-1 truncate text-center text-sm text-muted-foreground">
                            {pageName}
                        </p>
                        <CarouselNext className={carouselControlClassName} />
                    </div>

                    <div
                        className="min-h-0 min-w-0 flex-1 overflow-hidden px-4 pb-4"
                        data-testid="character-expanded-dialog-body"
                    >
                        <CarouselContent className="ml-0">
                            <CharacterCardInfoBlocks
                                characterId={characterId}
                            />
                            <CharacterCardGameInfo
                                characterId={characterId}
                            />
                            <CharacterCardAbilities
                                characterId={characterId}
                            />
                            <CharacterCardInventory
                                characterId={characterId}
                            />
                        </CarouselContent>
                    </div>
                </Carousel>
            </DialogContent>
        </Dialog>
    );
}
