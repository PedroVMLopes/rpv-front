"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { useParams } from "next/navigation";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { applyChoiceValidation } from "@/lib/character/choiceValidation";
import { applyAbilityScoreValidation } from "@/lib/character/abilityScoreGeneration";
import { AbilityScoresField } from "@/components/characters/AbilityScoresField";
import { HitPointsField } from "@/components/characters/HitPointsField";
import { ArmorClassField } from "@/components/characters/ArmorClassField";
import { presets } from "@/presets";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildPlayerGrantSourceFields } from "@/lib/character/playerFormFields";
import { CharacterGrantPickers } from "@/components/characters/CharacterGrantPickers";
import { useGrantPickSanitizer } from "@/lib/character/useGrantPickSanitizer";
import { useEffect, useMemo, useRef } from "react";
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
                    contentLocale
                ),
                presetData.statConfig
            ),
        [
            presetData.characters.schema,
            presetData.statConfig,
            characterType,
            contentLocale,
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

    const raceSlug = form.watch("race");
    const classSlug = form.watch("characterClass");
    const previousRaceRef = useRef<string | undefined>(
        typeof formDefaults?.race === "string" ? formDefaults.race : undefined
    );
    const previousClassRef = useRef<string | undefined>(
        typeof formDefaults?.characterClass === "string"
            ? formDefaults.characterClass
            : undefined
    );

    useGrantPickSanitizer(form, contentLocale);

    useEffect(() => {
        if (!formDefaults) {
            return;
        }

        form.reset(formDefaults);
        previousRaceRef.current =
            typeof formDefaults.race === "string" ? formDefaults.race : undefined;
        previousClassRef.current =
            typeof formDefaults.characterClass === "string"
                ? formDefaults.characterClass
                : undefined;
    }, [form, formDefaults]);

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

    const fields = useMemo(
        () =>
            buildPlayerGrantSourceFields(baseFields, {
                raceSlug,
                classSlug,
                contentLocale,
            }).filter(
                (field) =>
                    field.type !== "attributeGroup" &&
                    field.name !== "hp" &&
                    field.name !== "maxHp" &&
                    field.name !== "ac"
            ),
        [baseFields, raceSlug, classSlug, contentLocale]
    );

    function handleSave(data: Record<string, unknown>) {
        updateCharacter(id, {
            ...data,
            choices: form.getValues("choices"),
        });
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
            <h1 className="mb-2 text-lg font-bold bg-muted p-1 px-2 rounded">
                Edit {character.name}
            </h1>
            <AbilityScoresField
                form={form}
                abilities={presetData.statConfig.abilities}
                statConfig={presetData.statConfig}
                contentLocale={contentLocale}
            />
            <HitPointsField
                form={form}
                system={characterSystem}
                contentLocale={contentLocale}
            />
            <ArmorClassField
                form={form}
                system={characterSystem}
                contentLocale={contentLocale}
            />
            <DynamicForm form={form} fields={fields} onSubmit={handleSave} />
            <CharacterGrantPickers form={form} contentLocale={contentLocale} />
        </div>
    );
}
