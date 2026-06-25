"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { presets, SystemKey } from "@/presets";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { applyChoiceValidation } from "@/lib/character/choiceValidation";
import { applyAbilityScoreValidation } from "@/lib/character/abilityScoreGeneration";
import { AbilityScoresField } from "@/components/characters/AbilityScoresField";
import { HitPointsField } from "@/components/characters/HitPointsField";
import { ArmorClassField } from "@/components/characters/ArmorClassField";
import { ClassResourcesField } from "@/components/characters/ClassResourcesField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { buildPlayerGrantSourceFields } from "@/lib/character/playerFormFields";
import { CharacterGrantPickers } from "@/components/characters/CharacterGrantPickers";
import { useGrantPickSanitizer } from "@/lib/character/useGrantPickSanitizer";
import { getClassSubclassLevel } from "@rpv/content";
import { readLevelFromForm } from "@/lib/character/level";
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

    const raceSlug = form.watch("race");
    const classSlug = form.watch("characterClass");
    const level = form.watch("level");
    const previousRaceRef = useRef<string | undefined>(undefined);
    const previousClassRef = useRef<string | undefined>(undefined);
    const previousLevelRef = useRef<number | undefined>(undefined);

    useGrantPickSanitizer(form, contentLocale, system);

    useEffect(() => {
        if (
            previousRaceRef.current !== undefined &&
            previousRaceRef.current !== raceSlug
        ) {
            form.setValue("subrace", "");
        }

        previousRaceRef.current = raceSlug;
    }, [form, raceSlug]);

    useEffect(() => {
        if (
            previousClassRef.current !== undefined &&
            previousClassRef.current !== classSlug
        ) {
            form.setValue("subclass", "");
        }

        previousClassRef.current = classSlug;
    }, [form, classSlug]);

    useEffect(() => {
        const characterLevel = readLevelFromForm(form.getValues());
        const subclassLevel = classSlug
            ? getClassSubclassLevel(classSlug)
            : undefined;

        if (
            previousLevelRef.current !== undefined &&
            subclassLevel !== undefined &&
            characterLevel < subclassLevel
        ) {
            form.setValue("subclass", "");
        }

        previousLevelRef.current = characterLevel;
    }, [form, classSlug, level]);

    const fields = useMemo(
        () =>
            buildPlayerGrantSourceFields(baseFields, {
                raceSlug,
                classSlug,
                level: readLevelFromForm({ level }),
                contentLocale,
            }).filter(
                (field) =>
                    field.type !== "attributeGroup" &&
                    field.name !== "hp" &&
                    field.name !== "maxHp" &&
                    field.name !== "ac"
            ),
        [baseFields, raceSlug, classSlug, level, contentLocale]
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
                <HitPointsField
                    form={form}
                    system={system}
                    contentLocale={contentLocale}
                />
                <ArmorClassField
                    form={form}
                    system={system}
                    contentLocale={contentLocale}
                />
                <ClassResourcesField
                    form={form}
                    contentLocale={contentLocale}
                    system={system}
                />
                <DynamicForm form={form} fields={fields} onSubmit={handleSave} />
                <CharacterGrantPickers form={form} contentLocale={contentLocale} system={system} />
            </div>
        </div>
    );
}
