"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { presets, SystemKey } from "@/presets";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { applyChoiceValidation } from "@/lib/character/choiceValidation";
import { applyAbilityScoreValidation } from "@/lib/character/abilityScoreGeneration";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { PlayerCharacterForm } from "@/components/characters/PlayerCharacterForm";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePlayer() {
    const addCharacter = useCharacterStore((state) => state.addCharacter);
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const router = useRouter();

    const [system, setSystem] = useState<SystemKey>("dnd");
    const type = "player";

    const presetData = presets[system].presetData;

    const schema = useMemo(
        () =>
            applyAbilityScoreValidation(
                applyChoiceValidation(
                    createDynamicSchema(presetData.characters.schema, type),
                    contentLocale,
                    system
                ),
                presetData.statConfig
            ),
        [presetData.characters.schema, presetData.statConfig, type, contentLocale, system]
    );
    const baseFields = useMemo(
        () => [
            ...presetData.characters.fields.common,
            ...(presetData.characters.fields[type] || []),
        ],
        [presetData.characters.fields, type]
    );

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {},
    });

    function handleSave(data: Record<string, unknown>) {
        addCharacter(data, type, system);
        router.push("/characters/player");
    }

    return (
        <div>
            <Button asChild variant={"destructive"} className="font-semibold">
                <Link href={"/characters/player"}>Cancel</Link>
            </Button>
            <div className="mt-4 w-full">
                <PlayerCharacterForm
                    mode="create"
                    system={system}
                    form={form}
                    baseFields={baseFields}
                    statConfig={presetData.statConfig}
                    contentLocale={contentLocale}
                    onSave={handleSave}
                    header={
                        <>
                            <h1 className="mb-2 text-lg font-bold bg-muted p-1 px-2 rounded">
                                Create a New Player
                            </h1>
                            <select
                                className="bg-background font-semibold"
                                value={system}
                                onChange={(e) =>
                                    setSystem(e.target.value as SystemKey)
                                }
                            >
                                {Object.entries(presets).map(([key, preset]) => (
                                    <option key={key} value={key}>
                                        {preset.name}
                                    </option>
                                ))}
                            </select>
                        </>
                    }
                />
            </div>
        </div>
    );
}
