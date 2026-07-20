"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { useContentLocale } from "@/store/useContentLocale";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { resolveInitialStepId } from "@/lib/character/creationSteps";
import {
    resolvePlayerFormGraph,
    type PlayerFormMode,
} from "@/lib/character/characterCreationSteps";
import { flattenStoredToForm } from "@/lib/character/presetStats";
import { readLevelFromForm } from "@/lib/character/level";

function readLevelUpFromParam(
    searchParams: URLSearchParams,
    storedLevel: number
): number {
    const raw = searchParams.get("from");

    if (raw && raw.trim() !== "") {
        const parsed = Number(raw);

        if (Number.isFinite(parsed) && parsed >= 1) {
            return Math.min(Math.floor(parsed), 20);
        }
    }

    return storedLevel;
}

export default function EditPlayer() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const searchParams = useSearchParams();

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

    const isLevelUp = searchParams.get("mode") === "level-up";
    const formMode: PlayerFormMode = isLevelUp ? "level-up" : "edit";

    const storedLevel = character
        ? readLevelFromForm(character.systemData ?? {})
        : 1;
    const levelUpFromLevel = isLevelUp
        ? readLevelUpFromParam(searchParams, storedLevel)
        : undefined;
    const targetLevel =
        levelUpFromLevel !== undefined
            ? Math.min(levelUpFromLevel + 1, 20)
            : undefined;

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

    const levelUpDefaults = useMemo(() => {
        if (!formDefaults || targetLevel === undefined) {
            return formDefaults;
        }

        return { ...formDefaults, level: targetLevel };
    }, [formDefaults, targetLevel]);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: levelUpDefaults ?? formDefaults ?? {},
    });

    const initialStepId = useMemo(() => {
        if (!character) {
            return "race";
        }

        const formValues =
            levelUpDefaults ??
            formDefaults ??
            flattenStoredToForm(character, character.system);

        const graph = resolvePlayerFormGraph(
            formValues,
            characterSystem,
            contentLocale,
            {
                mode: formMode,
                levelUpFromLevel,
            }
        );

        const raw = searchParams.get("step");

        if (raw) {
            return resolveInitialStepId(raw, graph);
        }

        return graph.steps[0]?.id ?? "race";
    }, [
        character,
        characterSystem,
        contentLocale,
        formDefaults,
        formMode,
        levelUpDefaults,
        levelUpFromLevel,
        searchParams,
    ]);

    const initialFocusKey = useMemo(() => {
        const raw = searchParams.get("focus");
        return raw && raw.trim().length > 0 ? raw : undefined;
    }, [searchParams]);

    useEffect(() => {
        if (levelUpDefaults) {
            form.reset(levelUpDefaults);
        } else if (formDefaults) {
            form.reset(formDefaults);
        }
    }, [form, formDefaults, levelUpDefaults]);

    function handleSave(data: Record<string, unknown>) {
        updateCharacter(id, data);
        router.push(isLevelUp ? `/characters/player/${id}` : "/characters/player");
    }

    if (!character || !formDefaults) {
        return <p>Character not found</p>;
    }

    if (isLevelUp && storedLevel >= 20) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <p>Character is already at maximum level.</p>
                <Button asChild variant="outline">
                    <Link href={`/characters/player/${id}`}>Back to sheet</Link>
                </Button>
            </div>
        );
    }

    const cancelHref = isLevelUp
        ? `/characters/player/${id}`
        : "/characters/player";

    return (
        <div className="">
            <Button
                asChild
                variant={"destructive"}
                className="font-semibold mt-2 mb-4"
            >
                <Link href={cancelHref}>Cancel</Link>
            </Button>
            <PlayerCharacterForm
                mode={formMode}
                system={characterSystem}
                form={form}
                baseFields={baseFields}
                statConfig={presetData.statConfig}
                contentLocale={contentLocale}
                onSave={handleSave}
                initialStepId={initialStepId}
                initialFocusKey={initialFocusKey}
                levelUpFromLevel={levelUpFromLevel}
                header={
                    <h1 className="mb-2 text-lg font-bold bg-muted p-1 px-2 rounded">
                        {isLevelUp
                            ? `Level up — ${character.name}`
                            : `Edit ${character.name}`}
                    </h1>
                }
            />
        </div>
    );
}
