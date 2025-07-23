"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { characterSchemasByType } from "@/lib/zodSchemas";
import type * as z from "zod";

type EnemyData = z.infer<typeof characterSchemasByType.enemy>;

type EnemyFieldsProps = {
    form: UseFormReturn<EnemyData>;
}

export default function EnemyFields({ form }: EnemyFieldsProps) {
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
                        <Input placeholder="" {...field} />
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