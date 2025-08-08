"use client";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";

interface FieldConfig {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    defaultValue?: any;
    options?: string[];
    order?: number;
    group?: string;
    inlineGroup?: string;
    attributes?: Array<{
        name: string;
        label: string;
    }>;
    [x: string]: any;
}

interface DynamicFormProps {
    form: UseFormReturn<any>;
    fields: FieldConfig[];
    onSubmit?: (data: any) => void;
}

export function DynamicForm({ form, fields, onSubmit }: DynamicFormProps) {
    useEffect(() => {
        // Inicializa os atributos com valores padrão se não existirem
        const attributeGroupFields = fields.filter(field => field.type === "attributeGroup");
        attributeGroupFields.forEach(attField => {
            attField.attributes?.forEach((attribute, index) => {
                const currentName = form.getValues(`attributes.${index}.name`);
                const currentValue = form.getValues(`attributes.${index}.value`);
                
                if (!currentName) {
                    form.setValue(`attributes.${index}.name`, attribute.name);
                }
                if (currentValue === undefined || currentValue === null || currentValue === "") {
                    form.setValue(`attributes.${index}.value`, 10); // valor padrão
                }
            });
        });

    }, [fields, form, onSubmit]);

    if (!fields || fields.length === 0) {
        return <div>No fields to render</div>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Trigger validation and submission manually
        form.handleSubmit(
            (data) => {
                if (onSubmit) {
                    onSubmit(data);
                } else {
                    console.warn("No onSubmit function provided");
                }
            },
        )();
    };

    // Separa campos regulares dos attributeGroups
    const regularFields = fields.filter((field) => field.type !== "attributeGroup");
    const attributeGroupFields = fields.filter((field) => field.type === "attributeGroup");

    // Agrupa campos regulares
    const groupedFields = regularFields
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .reduce((groups: Record<string, FieldConfig[]>, field) => {
            const groupName = field.group || "default";
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(field);
            return groups;
        }, {});

    // Renderiza um campo individual
    const renderField = (fieldConfig: FieldConfig) => (
        <FormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>
                        {fieldConfig.label}
                        {fieldConfig.required && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                        {(() => {
                            switch (fieldConfig.type) {
                                case "text":
                                    return (
                                        <Input 
                                            {...field} 
                                            value={field.value ?? ""} 
                                            placeholder={fieldConfig.label}
                                        />
                                    );
                                
                                case "number":
                                    return (
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder={fieldConfig.label}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(value === "" ? "" : Number(value));
                                            }}
                                        />
                                    );
                                
                                case "select":
                                    return (
                                        <select
                                            {...field}
                                            value={field.value ?? ""}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select {fieldConfig.label}</option>
                                            {fieldConfig.options?.map((opt: string) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    );
                                
                                default:
                                    return (
                                        <Input 
                                            {...field} 
                                            value={field.value ?? ""} 
                                            placeholder={fieldConfig.label}
                                        />
                                    );
                            }
                        })()}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Renderiza grupos de campos regulares */}
                {Object.entries(groupedFields).map(([groupName, groupFields]) => (
                    <div key={groupName} className="space-y-4">
                        <h3 className="text-lg font-semibold capitalize">{groupName}</h3>

                        {Object.entries(
                            groupFields.reduce(
                                (inlineGroups: Record<string, FieldConfig[]>, field) => {
                                    const inline = field.inlineGroup || field.name;
                                    if (!inlineGroups[inline]) inlineGroups[inline] = [];
                                    inlineGroups[inline].push(field);
                                    return inlineGroups;
                                },
                                {}
                            )
                        ).map(([inlineKey, inlineFields]) => (
                            <div
                                key={inlineKey}
                                className={`grid gap-4`}
                                style={{
                                    gridTemplateColumns: `repeat(${Math.min(inlineFields.length, 4)}, 1fr)`
                                }}
                            >
                                {inlineFields.map((fieldConfig) => renderField(fieldConfig))}
                            </div>
                        ))}
                    </div>
                ))}

                {/* Renderiza grupos de atributos */}
                {attributeGroupFields.map((attField) => (
                    <div key={attField.name} className="space-y-4">
                        <h3 className="text-lg font-semibold">{attField.label}</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {attField.attributes?.map((attribute, index) => (
                                <div key={`${attribute.name}-${index}`} className="space-y-2">
                                    {/* Campo hidden para o name do atributo */}
                                    <FormField
                                        control={form.control}
                                        name={`attributes.${index}.name`}
                                        render={({ field }) => (
                                            <input
                                                type="hidden"
                                                {...field}
                                                value={attribute.name}
                                            />
                                        )}
                                    />
                                    
                                    {/* Campo visível para o value do atributo */}
                                    <FormField
                                        control={form.control}
                                        name={`attributes.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{attribute.label}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value === "" ? "" : Number(value));
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <Button 
                    type="submit" 
                    className="font-semibold"
                >
                    Save Character
                </Button>
            </form>
        </Form>
    );
}