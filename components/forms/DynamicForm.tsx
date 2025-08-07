"use client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { presets } from "@/presets";

interface FieldConfig {
    [x: string]: any;
    name: string;
    label: string;
    type: string;
    required?: boolean;
    defaultValue?: any;
    options?: string[];
}

interface DynamicFormProps {
    form: UseFormReturn<any>;
    fields: FieldConfig[];
    onSubmit?: (data: any) => void;
}

export function DynamicForm({ form, fields, onSubmit }: DynamicFormProps) {

    if (!fields || fields.length === 0) {
        return <div>No fields to render</div>;
    }

    const handleSubmit = form.handleSubmit((data) => {
        if (onSubmit) {
            onSubmit(data);
        }
    })

    // const presetData = presets[type]
    const attributeField = fields.find(field => field.type === "attributeGroup");

    // Renders all the fields passed as a list
    return (
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(handleSubmit)} 
                className="space-y-4"
            >
                {fields
                    .filter(field => field.type !== "attributeGroup")
                    .map((fieldConfig) => (
                    <FormField
                        key={fieldConfig.name}
                        control={form.control}
                        name={fieldConfig.name}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{fieldConfig.label}</FormLabel>
                                <FormControl>
                                    <div>
                                        {fieldConfig.type === "text" && <Input {...field} value={field.value ?? ""} />}
                                        {fieldConfig.type === "number" && <Input type="number" {...field} value={field.value ?? ""} />}
                                        {fieldConfig.type === "select" && (
                                            <select {...field} className="border rounded px-2 py-1 w-full bg-background">
                                                <option value="">Select an option</option>
                                                {fieldConfig.options?.map((opt: string) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {!["text", "number", "select"].includes(fieldConfig.type) && (
                                            <Input {...field} />
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}

                {fields
                    .filter(field => field.type == "attributeGroup")
                    .map((attField) => (
                        <div key={attField.name}>
                            <h3 className="text-md font-medium mb-2">{attField.label}</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {attField.attributes?.map((_attField: any, index: any) => (
                                    <FormField
                                        key={`${_attField.name}-${index}`}
                                        name={`attributes.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {_attField.label}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                }

                <Button type="submit">Save</Button>
            </form>
        </Form>
    );
}