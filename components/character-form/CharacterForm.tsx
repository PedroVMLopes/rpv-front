"use client"

import { useForm } from "react-hook-form";
import { characterSchema } from "@/lib/zodSchemas"
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form } from "@/components/ui/form";
import { Button } from "../ui/button";
import CommonFields from "./fields/CommonFields";
import PlayerFields from "./fields/PlayerFields";
import EnemyFields from "./fields/EnemyFields";

type CharacterFormData = z.infer<typeof characterSchema>;

type CharacterFormProps = {
  type: "player" | "enemy" | "npc";
  defaultValues?: Partial<z.infer<typeof characterSchema>>;
  onSubmit: (data: z.infer<typeof characterSchema>) => void;
};

export default function CharacterForm({ type, defaultValues, onSubmit}: CharacterFormProps) {
  const form = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      ...defaultValues,
      type,
    },
  })

  const { handleSubmit } = form;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Common Fields */}
        <CommonFields form={form} type={type} />

        {/* Player Specific Fields */}
        {type === "player" && <PlayerFields form={form} />}

        {/* Enemy Specific Fields */}
        {type === "enemy" && <EnemyFields form={form} />}

        <Button type="submit">Salvar</Button>

      </form>
    </Form>
  )
}