"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { useParams } from "next/navigation";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { presets } from "@/presets";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditNpc() {
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
        defaultValues: character as any,
    });

    return (
        <div className="gap-2">
            <Button asChild variant={"destructive"} className="font-semibold mt-2 mb-4">
                <Link href={"/characters/npc"}>Return</Link>
            </Button>
            <DynamicForm 
                form={form}
                fields={fields}
                onSubmit={(data) => updateCharacter(id, data)}
            />
        </div>
    );
}
