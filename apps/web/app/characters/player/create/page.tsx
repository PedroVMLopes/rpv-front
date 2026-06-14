"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { presets, SystemKey } from "@/presets";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { applyChoiceValidation } from "@/lib/character/choiceValidation";
import { applyAbilityScoreValidation } from "@/lib/character/abilityScoreGeneration";
import { AbilityScoresField } from "@/components/characters/AbilityScoresField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { buildPlayerRaceFields } from "@/lib/character/playerFormFields";
import { CharacterGrantPickers } from "@/components/characters/CharacterGrantPickers";
import { useEffect, useMemo, useRef, useState } from "react";
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
                    contentLocale
                ),
                presetData.statConfig
            ),
        [presetData.characters.schema, presetData.statConfig, type, contentLocale]
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

    const raceSlug = form.watch("race");
    const previousRaceRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (
            previousRaceRef.current !== undefined &&
            previousRaceRef.current !== raceSlug
        ) {
            form.setValue("subrace", "");
        }

        previousRaceRef.current = raceSlug;
    }, [form, raceSlug]);

    const fields = useMemo(
        () =>
            buildPlayerRaceFields(baseFields, raceSlug, contentLocale).filter(
                (field) => field.type !== "attributeGroup"
            ),
        [baseFields, raceSlug, contentLocale]
    );

    function handleSave(data: Record<string, unknown>) {
        addCharacter(
            {
                ...data,
                choices: form.getValues("choices"),
            },
            type,
            system
        );
        router.push("/characters/player");
    }

    return (
        <div>
            <Button asChild variant={"destructive"} className="font-semibold">
                <Link href={"/characters/player"}>Cancel</Link>
            </Button>
            <div className="mt-4 w-full flex flex-col gap-4">
                <h1 className="mb-2 text-lg font-bold bg-muted p-1 px-2 rounded">
                    Create a New Player
                </h1>
                <select
                    className="bg-background font-semibold"
                    value={system}
                    onChange={(e) => setSystem(e.target.value as SystemKey)}
                >
                    {Object.entries(presets).map(([key, preset]) => (
                        <option key={key} value={key}>
                            {preset.name}
                        </option>
                    ))}
                </select>
                <AbilityScoresField
                    form={form}
                    abilities={presetData.statConfig.abilities}
                    statConfig={presetData.statConfig}
                    contentLocale={contentLocale}
                />
                <DynamicForm form={form} fields={fields} onSubmit={handleSave} />
                <CharacterGrantPickers form={form} contentLocale={contentLocale} />
            </div>
        </div>
    );
}
