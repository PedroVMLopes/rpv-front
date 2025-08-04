"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { characterSchemasByType } from "@/lib/oldZodSchemas";
import type * as z from "zod";

type CharacterType = keyof typeof characterSchemasByType;

type PlayerData = z.infer<typeof characterSchemasByType.player>;
type EnemyData = z.infer<typeof characterSchemasByType.enemy>;
type NpcData = z.infer<typeof characterSchemasByType.npc>;

type CharacterData = PlayerData | EnemyData | NpcData;

type CommonFieldsProps = {
  form: UseFormReturn<CharacterData>;
  type: CharacterType;
};

export default function CommonFields({ form, type }: CommonFieldsProps) {
    return (
        <>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="Character's Name" 
                                {...field}
                                value={field.value?.toString() || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <input type="hidden" value={type} {...form.register("type")} />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="hp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Health</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    value={field.value?.toString() || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const numValue = value === "" ? undefined : Number(value);
                                        
                                        // Updates the HP value in the form
                                        field.onChange(numValue);

                                        // Updates the maxHp value using the HP value
                                        if (numValue !== undefined) {
                                            form.setValue("maxHp", numValue);
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="ac"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Armor</FormLabel>
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
            </div>

            <FormField
                control={form.control}
                name="initiative"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Initiative</FormLabel>
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
        </>
    )
}