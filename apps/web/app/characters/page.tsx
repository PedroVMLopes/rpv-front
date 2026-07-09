import { CharacterHubSection } from "@/components/characters/CharacterHubSection";

export default function Characters() {
    return (
        <div className="flex flex-col items-center py-4 md:py-10">
            <div className="flex flex-col gap-6 w-full max-w-7xl">
                <CharacterHubSection type="player" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <CharacterHubSection type="enemy" />
                    <CharacterHubSection type="npc" />
                </div>
            </div>
        </div>
    );
}
