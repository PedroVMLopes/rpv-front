"use client"
import { useForm } from "react-hook-form";
import { characterSchemasByType } from "@/lib/oldZodSchemas"
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "../ui/button";
import CommonFields from "./fields/CommonFields";
import PlayerFields from "./fields/PlayerFields";
import EnemyFields from "./fields/EnemyFields";

// Schema specific types
type PlayerData = z.infer<typeof characterSchemasByType.player>;
type EnemyData = z.infer<typeof characterSchemasByType.enemy>;
type NpcData = z.infer<typeof characterSchemasByType.npc>;

// Type specific props
type PlayerFormProps = {
  type: 'player';
  defaultValues?: Partial<PlayerData>;
  onSubmit: (data: PlayerData) => void;
};

type EnemyFormProps = {
  type: 'enemy';
  defaultValues?: Partial<EnemyData>;
  onSubmit: (data: EnemyData) => void;
};

type NpcFormProps = {
  type: 'npc';
  defaultValues?: Partial<NpcData>;
  onSubmit: (data: NpcData) => void;
};

type CharacterFormProps = PlayerFormProps | EnemyFormProps | NpcFormProps;

export default function CharacterForm(props: CharacterFormProps) {
  const { type, defaultValues, onSubmit } = props;
  const schema = characterSchemasByType[type];
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      type,
    } as any,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Common Fields */}
        <CommonFields form={form} type={type} />
        
        {/* Type Specific Fields */}
        {type === "player" && <PlayerFields form={form} />}
        {type === "enemy" && <EnemyFields form={form} />}
        
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}