"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { applyChoiceValidation } from "@/lib/character/choiceValidation";
import { applyAbilityScoreValidation } from "@/lib/character/abilityScoreGeneration";
import { presets } from "@/presets";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlayerCharacterForm } from "@/components/characters/PlayerCharacterForm";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditPlayer() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const updateCharacter = useCharacterStore((state) => state.updateCharacter);
    const getFormDefaults = useCharacterStore((state) => state.getFormDefaults);
    const characters = useCharacterStore((state) => state.characters);
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const router = useRouter();

    const character = characters.find((c) => c.id === id);
    const formDefaults = useMemo(
        () => (character ? getFormDefaults(id) : undefined),
        [character, getFormDefaults, id]
    );

    const characterSystem = character?.system ?? "dnd";
    const characterType = character?.type ?? "player";
    const presetData = presets[characterSystem].presetData;

    const schema = useMemo(
        () =>
            applyAbilityScoreValidation(
                applyChoiceValidation(
                    createDynamicSchema(presetData.characters.schema, characterType),
                    contentLocale,
                    characterSystem
                ),
                presetData.statConfig
            ),
        [
            presetData.characters.schema,
            presetData.statConfig,
            characterType,
            contentLocale,
            characterSystem,
        ]
    );

    const baseFields = useMemo(
        () => [
            ...presetData.characters.fields.common,
            ...(presetData.characters.fields[characterType] || []),
        ],
        [presetData.characters.fields, characterType]
    );

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: formDefaults ?? {},
    });

    useEffect(() => {
        if (formDefaults) {
            form.reset(formDefaults);
        }
    }, [form, formDefaults]);

    function handleSave(data: Record<string, unknown>) {
        updateCharacter(id, data);
        router.push("/characters/player");
    }

    if (!character || !formDefaults) {
        return <p>Character not found</p>;
    }

    return (
        <div className="">
            <Button
                asChild
                variant={"destructive"}
                className="font-semibold mt-2 mb-4"
            >
                <Link href={"/characters/player"}>Cancel</Link>
            </Button>
            <PlayerCharacterForm
                mode="edit"
                system={characterSystem}
                form={form}
                baseFields={baseFields}
                statConfig={presetData.statConfig}
                contentLocale={contentLocale}
                onSave={handleSave}
                header={
                    <h1 className="mb-2 text-lg font-bold bg-muted p-1 px-2 rounded">
                        Edit {character.name}
                    </h1>
                }
            />
        </div>
    );
}
