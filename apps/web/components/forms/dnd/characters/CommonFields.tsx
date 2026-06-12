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

type LabeledConfig = { labelKey?: string; label?: string; name?: string };

export default function CommonFields({ system }: FieldsProps) {
    const { control } = useFormContext();
    const t = useTranslations();
    const presetData = presets[system].presetData.characters;

    const resolveLabel = (item: LabeledConfig) =>
        item.labelKey ? t(item.labelKey) : item.label ?? item.name ?? "";

    // Pega os campos comuns do preset
    const commonFields = presetData.fields.common;

    // Encontra o campo de atributos no array de campos comuns
    const attributeField = commonFields.find(field => field.type === "attributeGroup");

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("character.commonFields")}</h2>
            
            {/* Renderiza todos os campos comuns exceto o attributeGroup */}
            {commonFields
                .filter(field => field.type !== "attributeGroup")
                .map((fieldConfig) => (
                    <FormField
                        key={fieldConfig.name}
                        control={control}
                        name={fieldConfig.name}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{resolveLabel(fieldConfig)}</FormLabel>
                                <FormControl>
                                    <Input 
                                        type={fieldConfig.type} 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            
            {/* Renderiza o grupo de atributos se existir */}
            {attributeField && (
                <div>
                    <h3 className="text-md font-medium mb-2">{resolveLabel(attributeField)}</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {attributeField.attributes?.map((attributeConfig, index) => (
                            <FormField
                                key={`${attributeConfig.name}-${index}`}
                                control={control}
                                name={`attributes.${index}.value`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {resolveLabel(attributeConfig)}
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}