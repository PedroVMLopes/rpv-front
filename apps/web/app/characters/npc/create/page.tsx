"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { presets, SystemKey } from "@/presets";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useState } from "react";

export default function CreateNpc() {
    const addCharacter = useCharacterStore((state) => state.addCharacter);
    
    const [system, setSystem] = useState<SystemKey>("dnd");
    const type = "npc";

    const presetData = presets[system].presetData;

    const schema = createDynamicSchema(presetData.characters.schema, type);
    const fields = [...presetData.characters.fields.common, ...(presetData.characters.fields[type] || [])];

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {}
    });

    function handleSave(data: any) {
        addCharacter(data, type, system);
    }

    return (
        <div>
            <Button asChild variant={"destructive"} className="font-semibold">
                <Link href={"/characters/npc"}>Cancel</Link>
            </Button>
            <div className="mt-4 w-full flex flex-col gap-4">
                <h1 className="mb-2 text-lg font-bold bg-muted p-1 px-2 rounded">Create a New NPC</h1>
                <select className="bg-background font-semibold" value={system} onChange={(e) => setSystem(e.target.value as any)}>
                    {Object.entries(presets).map(([key, preset]) => (
                        <option key={key} value={key}>
                            {preset.name}
                        </option>
                    ))}
                </select>
                <DynamicForm form={form} fields={fields} onSubmit={handleSave} />
            </div>
        </div>
    )
}