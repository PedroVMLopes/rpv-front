"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CharacterFormData } from "@/lib/zodSchemas";

type Props = {
  form: UseFormReturn<CharacterFormData>;
};

export default function PlayerFields({ form }: Props) {
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
                            type="string" 
                            value={field.value?.toString() || ""}
                            onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? undefined : value);
                            }}
                        />
                    </FormControl>
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
                            type="string" 
                            value={field.value?.toString() || ""}
                            onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? undefined : value);
                            }}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
        </>
    )
}