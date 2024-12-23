import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { datasetSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  commonParams: z.object({
    dataset_id: z.string(),
  }),
  jsonBody: z.object({
    is_processing: z.literal(false),
  }),
  jsonResponse: z.object({
    dataset: datasetSchema,
  }),
})((req, ctx) => {
  const { dataset_id } = req.commonParams
  const { is_processing } = req.jsonBody

  // Find the dataset
  const dataset = ctx.db
    .getState()
    .datasets.find((d) => d.dataset_id === dataset_id)

  if (!dataset) {
    return ctx.error(404, {
      error_code: "dataset_not_found",
      message: `Dataset not found: ${dataset_id}`,
    })
  }

  // Verify ownership
  if (dataset.registry_account_id !== ctx.auth.account_id) {
    return ctx.error(403, {
      error_code: "not_authorized",
      message: "You do not have permission to update this dataset",
    })
  }

  // Update the dataset
  ctx.db.setState((state) => {
    const dataset = state.datasets.find((d) => d.dataset_id === dataset_id)
    if (dataset) {
      dataset.is_processing = is_processing
    }
    return state
  })

  // Get the updated dataset
  const updatedDataset = ctx.db
    .getState()
    .datasets.find((d) => d.dataset_id === dataset_id)!

  return ctx.json({ dataset: updatedDataset })
})
