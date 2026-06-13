"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { useParams } from "next/navigation";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { presets } from "@/presets";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildPlayerRaceFields } from "@/lib/character/playerFormFields";
import { CharacterGrantPickers } from "@/components/characters/CharacterGrantPickers";
import { useEffect, useMemo, useRef } from "react";

export default function EditPlayer() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const updateCharacter = useCharacterStore((state) => state.updateCharacter);
    const getFormDefaults = useCharacterStore((state) => state.getFormDefaults);
    const characters = useCharacterStore((state) => state.characters);
    const contentLocale = useContentLocale((state) => state.contentLocale);

    const character = characters.find((c) => c.id === id);
    const formDefaults = character ? getFormDefaults(id) : undefined;

    const characterSystem = character?.system ?? "dnd";
    const characterType = character?.type ?? "player";
    const presetData = presets[characterSystem].presetData;

    const schema = useMemo(
        () => createDynamicSchema(presetData.characters.schema, characterType),
        [presetData.characters.schema, characterType]
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
    const previousRaceRef = useRef<string | undefined>(
        typeof formDefaults?.race === "string" ? formDefaults.race : undefined
    );

    useEffect(() => {
        if (formDefaults) {
            form.reset(formDefaults);
            previousRaceRef.current =
                typeof formDefaults.race === "string"
                    ? formDefaults.race
                    : undefined;
        }
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

    const fields = useMemo(
        () => buildPlayerRaceFields(baseFields, raceSlug, contentLocale),
        [baseFields, raceSlug, contentLocale]
    );

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
                <Link href={"/characters/player"}>Return</Link>
            </Button>
            <DynamicForm
                form={form}
                fields={fields}
                onSubmit={(data) =>
                    updateCharacter(id, {
                        ...data,
                        choices: form.getValues("choices"),
                    })
                }
            />
            <CharacterGrantPickers form={form} contentLocale={contentLocale} />
        </div>
    );
}
