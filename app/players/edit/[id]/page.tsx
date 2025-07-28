"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { useParams } from "next/navigation";
import CharacterForm from "@/components/character-form/CharacterForm";

export default function EditPlayer() {
  const params = useParams<{ id: string}>();
  const id = params.id;
  const characters = useCharacterStore((state) => state.characters);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);

  const character = characters.find((c) => c.id === id);
  if (!character) return <p>Character not found</p>;

  return (
    <CharacterForm
      type={character.type}
      defaultValues={character}
      onSubmit={(data: Partial<typeof character>) => updateCharacter(id, data)}
    />
  );
}
