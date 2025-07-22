"use client"

import { useForm } from "react-hook-form";
import { characterSchema } from "@/lib/zodSchemas"
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type CharacterFormProps = {
  type: "player" | "enemy" | "npc";
  defaultValues?: Partial<z.infer<typeof characterSchema>>;
  onSubmit: (data: z.infer<typeof characterSchema>) => void;
};

export default function CharacterForm({ type, defaultValues, onSubmit}: CharacterFormProps) {
  const form = useForm<z.infer<typeof characterSchema>>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      ...defaultValues,
      type,
    },
  })

  const { handleSubmit } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Character's Name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <input type="hidden" value={type} {...form.register("type")} />

        <div className="grid grid-cols-3 gap-4">
          {["hp", "maxHp", "ac", "initiative"].map((key) => (
            <FormField
              key={key}
              control={form.control}
              name={key as "hp" | "maxHp" | "ac" | "initiative"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{key}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

         {/* Player Specific Fields */}
        {type === "player" && (
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
        )}

        {/* Enemy Specific Fields */}
        {type === "enemy" && (
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
        )}

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

        <Button type="submit">Salvar</Button>

      </form>
    </Form>
  )
}