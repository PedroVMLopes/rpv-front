"use client";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormProvider, UseFormReturn } from "react-hook-form";
import CommonFields from "./CommonFields";
import { SystemKey } from "@/presets";
import PlayerFields from "./PlayerFields";

interface FieldConfig {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    defaultValue?: any;
    options?: string[];
}

interface CharacterFormProps {
    form: UseFormReturn<any>;
    fields: FieldConfig[];
    onSubmit?: (data: any) => void;
    system: SystemKey;
    type: string;
}

export default function CharacterForm({
    form,
    fields,
    onSubmit,
    system,
    type,
}: CharacterFormProps) {
    const handleSubmit = form.handleSubmit((data) => {
        if (onSubmit) {
            onSubmit(data);
        }
    });

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">

                {type === "player" ? <PlayerFields system={system} /> : ""}
                
                <CommonFields system={system} />

                <Button type="submit" className="w-full">
                    Save
                </Button>
            </form>
        </FormProvider>
    );
}
