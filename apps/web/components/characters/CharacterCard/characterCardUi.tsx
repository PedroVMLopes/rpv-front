import type { ReactNode } from "react";
import { FaHeart, FaShield } from "react-icons/fa6";
import { ScrollArea } from "@/components/ui/scroll-area";

export function getAvatarUrl(
    systemData: Record<string, unknown>
): string | undefined {
    const avatar = systemData.avatar ?? systemData.image;
    if (typeof avatar === "string" && avatar.trim()) {
        return avatar;
    }
    return undefined;
}

export function formatLevel(level: unknown): number | undefined {
    if (typeof level === "number" && !Number.isNaN(level)) {
        return level;
    }
    if (typeof level === "string" && level !== "") {
        const parsed = Number(level);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
}

export function CharacterTitle({
    name,
    level,
}: {
    name: string;
    level?: unknown;
}) {
    const levelNum = formatLevel(level);
    return (
        <>
            {name}
            {levelNum !== undefined && (
                <span className="text-sm font-semibold opacity-50">
                    {" "}
                    lv {levelNum}
                </span>
            )}
        </>
    );
}

export function HpAcOverlay({
    currentHp,
    maxHp,
    ac,
}: {
    currentHp: number;
    maxHp: number;
    ac: number;
}) {
    return (
        <div className="absolute bottom-1 left-1 flex flex-col gap-0.5">
            <div className="flex flex-row items-center rounded-2xl bg-black/15 p-0.5 px-1.5 font-bold backdrop-blur">
                <FaHeart className="mr-1" /> {currentHp}{" "}
                <span className="opacity-60">/{maxHp}</span>
            </div>
            <div className="flex flex-row items-center rounded-2xl bg-black/15 p-0.5 px-1.5 font-bold backdrop-blur-2xl">
                <FaShield className="mr-1" /> {ac}
            </div>
        </div>
    );
}

export function CharacterPortrait({
    avatarUrl,
    name,
    currentHp,
    maxHp,
    ac,
    className,
}: {
    avatarUrl: string;
    name: string;
    currentHp: number;
    maxHp: number;
    ac: number;
    className?: string;
}) {
    return (
        <div
            className={
                className ??
                "relative w-full overflow-hidden rounded-2xl max-h-96"
            }
        >
            <img
                src={avatarUrl}
                alt={name}
                className="h-full max-h-[28vh] w-full object-cover sm:max-h-[32vh]"
            />
            <HpAcOverlay currentHp={currentHp} maxHp={maxHp} ac={ac} />
        </div>
    );
}

const PAGE_NAMES = [
    "Character Info",
    "Skills",
    "Actions & Abilities",
    "Inventory",
] as const;

export function getCarouselPageName(slideIndex: number): string {
    return PAGE_NAMES[slideIndex] ?? PAGE_NAMES[0];
}

export function CharacterCardSlide({ children }: { children: ReactNode }) {
    return (
        <ScrollArea
            className="h-full max-h-full min-w-0"
            data-testid="character-card-slide-scroll"
        >
            <div className="flex min-w-0 max-w-full flex-col gap-3 pr-3">
                {children}
            </div>
        </ScrollArea>
    );
}
