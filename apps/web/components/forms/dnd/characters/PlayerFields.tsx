"use client";

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { SystemKey } from "@/presets";
import { presets } from "@/presets";

interface FieldsProps {
    system: SystemKey;
}

export default function PlayerFields({ system }: FieldsProps) {
    const { control } = useFormContext();
    const t = useTranslations();
    const presetData = presets[system].presetData.characters;

    const playerFields = presetData.fields.player;
    const resolveLabel = (item: { labelKey?: string; label?: string; name?: string }) =>
        item.labelKey ? t(item.labelKey) : item.label ?? item.name ?? "";

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Level */}
            <FormField
                key={playerFields[0].name}
                control={control}
                name={playerFields[0].name}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{resolveLabel(playerFields[0])}</FormLabel>
                        <FormControl>
                            <Input 
                                type={playerFields[0].type} 
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {/* Class */}
            <FormField
                key={playerFields[1].name}
                control={control}
                name={playerFields[1].name}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{resolveLabel(playerFields[1])}</FormLabel>
                        <FormControl>
                            <Input 
                                type={playerFields[1].type} 
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}