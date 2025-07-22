"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CharacterFormData } from "@/lib/zodSchemas";

type Props = {
  form: UseFormReturn<CharacterFormData>;
  type: "player" | "enemy" | "npc";
};

export default function PlayerFields({ form }: Props) {
    return (
        <>
            <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Mage" {...field} />
                    </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    </FormItem>
                )}
            />
        </>
    )
}