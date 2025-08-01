"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { presets } from "@/presets";
import { createDynamicSchema } from "@/lib/schema/zodDynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DynamicForm } from "@/components/forms/DynamicForm";

export default function CreatePlayer() {
    
    const system = "dnd";
    const type = "player";
    
    const preset = presets[system];
    const schema = createDynamicSchema(preset.characters.schema, type);
    const fields = [...preset.characters.fields.common, ...(preset.characters.fields[type] || [])];

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {}
    });

    return (
        <div>
            <Button asChild variant={"destructive"} className="font-semibold">
                <Link href={"/players"}>Cancel</Link>
            </Button>
            <div className="mt-4 w-full flex flex-col items-center">
                <h1 className="mb-4">Create a New Player</h1>
                <DynamicForm form={form} fields={fields} />
            </div>
        </div>
    )
}