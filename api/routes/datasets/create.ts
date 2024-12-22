import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { datasetSchema } from "@/api/lib/db/schema"
import { randomUUID } from "crypto"

export default withRouteSpec({
  methods: ["POST"],
  jsonBody: z.object({
    dataset_name: z.string(),
    median_trace_count: z.number(),
    max_layer_count: z.number(),
    license_type: z.string(),
    description_md: z.string().optional(),
    github_url: z.string().url().optional(),
    website_url: z.string().url().optional(),
    license_url: z.string().url().optional(),
    version: z.string().optional(),
  }),
  jsonResponse: z.object({
    dataset: datasetSchema,
  }),
})((req, ctx) => {
  const { dataset_name, ...rest } = req.jsonBody

  // Check if dataset already exists with this name for this owner
  const existingDataset = ctx.db
    .getState()
    .datasets.find(
      (d) => d.dataset_name === dataset_name && d.owner_name === "test-user"
    )

  if (existingDataset) {
    return ctx.error(409, {
      error_code: "dataset_already_exists",
      message: `A dataset named '${dataset_name}' already exists for this user`,
    })
  }

  // In our mock implementation, we'll use a fixed github username
  const owner_name = "test-user"

  const newDataset = {
    dataset_id: randomUUID(),
    dataset_name_with_owner: `${owner_name}/${dataset_name}`,
    dataset_name,
    owner_name,
    sample_count: 0,
    median_trace_count: rest.median_trace_count,
    max_layer_count: rest.max_layer_count,
    star_count: 0,
    version: rest.version ?? "1.0.0",
    description_md: rest.description_md,
    created_at: new Date().toISOString(),
  }

  // Add to our local DB state
  ctx.db.setState((state) => {
    state.datasets.push(newDataset)
    return state
  })

  return ctx.json({ dataset: newDataset })
})
