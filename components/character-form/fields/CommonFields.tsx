"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CharacterFormData } from "@/lib/zodSchemas";

type Props = {
  form: UseFormReturn<CharacterFormData>;
  type: "player" | "enemy" | "npc";
};

export default function CommonFields({ form, type}:Props) {
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
                        placeholder="Character's Name" {...field}
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        />
                    </FormControl>
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
                                    const value = Number(e.target.value);

                                    // Atualiza o valor de hp no formulário
                                    field.onChange(value);

                                    // Atualiza o valor de maxHp de forma invisível
                                    form.setValue("maxHp", value);
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