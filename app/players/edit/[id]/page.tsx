"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { useParams } from "next/navigation";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { type } from "os";
import { presets } from "@/presets";

export default function EditPlayer() {
    const params = useParams<{ id: string}>();
    const id = params.id;
    const characters = useCharacterStore((state) => state.characters);
    const updateCharacter = useCharacterStore((state) => state.updateCharacter);

    const character = characters.find((c) => c.id === id);
    if (!character) return <p>Character not found</p>;

    const characterSystem = character.system;
    const presetData = presets[characterSystem].presetData;

    const schema = createDynamicSchema(presetData.characters.schema, character.type);
    const fields = [...presetData.characters.fields.common, ...(presetData.characters.fields[character.type] || [])];

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {}
    });

    return (
        <DynamicForm 
            form={form}
            fields={fields}
            onSubmit={(data: Partial<typeof character>) => updateCharacter(id, data)}
        />
    );
}
