"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { useParams } from "next/navigation";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function EditPlayer() {
    const params = useParams<{ id: string}>();
    const id = params.id;
    const characters = useCharacterStore((state) => state.characters);
    const updateCharacter = useCharacterStore((state) => state.updateCharacter);

    const character = characters.find((c) => c.id === id);
    if (!character) return <p>Character not found</p>;

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {}
    });

    return (
        <DynamicForm 
            
        />
    );
}
