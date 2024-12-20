import { z } from "zod"

// When defining your database schema, try to use snake case for column names.

export const datasetSchema = z.object({
  dataset_id: z.string(),
  name_with_owner: z.string(),
  name_without_owner: z.string(),
  owner_name: z.string(),

  sample_count: z.number(),
  median_trace_count: z.number(),
  max_layer_count: z.number(),

  created_at: z.string().datetime(),
})

export const thingSchema = z.object({
  thing_id: z.string(),
  name: z.string(),
  description: z.string(),
})
export type Thing = z.infer<typeof thingSchema>

export const databaseSchema = z.object({
  idCounter: z.number().default(0),
  things: z.array(thingSchema).default([]),
})
export type DatabaseSchema = z.infer<typeof databaseSchema>
