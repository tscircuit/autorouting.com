import { z } from "zod"

// When defining your database schema, try to use snake case for column names.

export const datasetSchema = z.object({
  dataset_id: z.string(),
  dataset_name_with_owner: z.string(),
  dataset_name: z.string(),
  owner_name: z.string(),

  sample_count: z.number(),
  median_trace_count: z.number(),
  max_layer_count: z.number(),

  updated_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
})

export const sampleSchema = z.object({
  sample_id: z.string(),
  dataset_id: z.string(),
  sample_number: z.number(),
  created_at: z.string().datetime(),
})

export const sampleFileSchema = z.object({
  sample_file_id: z.string(),
  sample_id: z.string(),

  file_path: z.string(),
  mimetype: z.string(),

  text_content: z.string().optional(),

  created_at: z.string().datetime(),
})

export const autorouterSchema = z.object({
  autorouter_id: z.string(),

  autorouter_name: z.string(),

  version: z.string().optional(),

  description_md: z.string(),

  github_url: z.string().url().optional(),
  website_url: z.string().url().optional(),

  license_type: z.enum(["MIT", "GPL", "Proprietary"]),
  license_url: z.string().url().optional(),

  created_at: z.string().datetime(),
})

export const autorouterRunResultSchema = z.object({
  autorouter_run_result_id: z.string(),
  autorouter_id: z.string(),
  sample_id: z.string(),

  started_at: z.string().datetime(),
  finished_at: z.string().datetime(),

  tscircuit_checks_passing: z.boolean(),

  runner_system: z.object({
    operating_system: z.string().optional(),
    cloud_provider: z.string().optional(),
    cpus: z.number().optional(),
    memory_gb: z.number().optional(),
    cluster_name: z.string().optional(),
  }),

  created_at: z.string().datetime(),
})

export const databaseSchema = z.object({
  id_counter: z.number().default(0),

  datasets: z.array(datasetSchema).default([]),
  samples: z.array(sampleSchema).default([]),
  sample_files: z.array(sampleFileSchema).default([]),
  autorouters: z.array(autorouterSchema).default([]),
  autorouter_run_results: z.array(autorouterRunResultSchema).default([]),
})

export type DatabaseSchema = z.infer<typeof databaseSchema>
