"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { characterSchemasByType } from "@/lib/zodSchemas";
import type * as z from "zod";

type PlayerData = z.infer<typeof characterSchemasByType.player>;
type EnemyData = z.infer<typeof characterSchemasByType.enemy>;
type NpcData = z.infer<typeof characterSchemasByType.npc>;

type CharacterData = PlayerData | EnemyData | NpcData;

type PlayerFieldsProps = {
  form: UseFormReturn<CharacterData>;
};

export default function PlayerFields({ form }: PlayerFieldsProps) {
    return (
        <>
            <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                value={field.value?.toString() || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === "" ? undefined : Number(value));
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., Fighter, Wizard, Rogue"
                                value={field.value || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === "" ? undefined : value);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            <FormField
                control={form.control}
                name="subclass"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subclass</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., Champion, Evocation, Thief"
                                value={field.value || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === "" ? undefined : value);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}