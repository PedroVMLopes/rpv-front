"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { useParams } from "next/navigation";
import { DynamicForm } from "@/components/forms/DynamicForm";

export default function EditPlayer() {
  const params = useParams<{ id: string}>();
  const id = params.id;
  const characters = useCharacterStore((state) => state.characters);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);

  const character = characters.find((c) => c.id === id);
  if (!character) return <p>Character not found</p>;

  return (
    <DynamicForm
      type={character.type}
      defaultValues={character}
      onSubmit={(data: Partial<typeof character>) => updateCharacter(id, data)}
    />
  );
}
