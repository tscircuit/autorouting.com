import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { sampleSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  commonParams: z.object({
    dataset_id: z.string(),
    sample_number: z.coerce.number(),
  }),
  jsonResponse: z.object({
    sample: sampleSchema,
  }),
})((req, ctx) => {
  const { dataset_id, sample_number } = req.commonParams

  // First verify the dataset exists
  const dataset = ctx.db
    .getState()
    .datasets.find((d) => d.dataset_id === dataset_id)

  if (!dataset) {
    return ctx.error(404, {
      error_code: "dataset_not_found",
      message: `Dataset not found: ${dataset_id}`,
    })
  }

  // Create the sample
  const newSample = {
    sample_id: `sample-${ctx.db.getState().samples.length + 1}`,
    dataset_id,
    sample_number,
    created_at: new Date().toISOString(),
  }

  // Add to our local DB state
  ctx.db.setState((state) => {
    state.samples.push(newSample)
    return state
  })

  return ctx.json({ sample: newSample })
})
