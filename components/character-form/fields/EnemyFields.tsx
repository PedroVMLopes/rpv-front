"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CharacterFormData } from "@/lib/zodSchemas";

type Props = {
  form: UseFormReturn<CharacterFormData>;
};

export default function EnemyFields({ form }: Props) {
    return (
        <>
            <>
                <FormField
                control={form.control}
                name="creatureType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo de criatura</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Morto-vivo" {...field} />
                    </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="cr"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>CR (Nível de desafio)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    </FormItem>
                )}
                />
            </>
        
            <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                        <Input placeholder="Special Notes" {...field} />
                    </FormControl>
                    </FormItem>
                )}
            />
        </>
    )
}