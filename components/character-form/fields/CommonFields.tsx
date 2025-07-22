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

            <div className="grid grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="hp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>HP</FormLabel>
                            <FormControl>
                            <Input 
                                type="number" 
                                value={field.value?.toString() || ""}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="maxHp"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>MAX HP</FormLabel>
                        <FormControl>
                        <Input 
                            type="number" 
                            value={field.value?.toString() || ""}
                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                        <FormLabel>AC</FormLabel>
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