import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { datasetSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z.object({
    dataset_id: z.string(),
  }),
  jsonResponse: z.object({
    dataset: datasetSchema,
  }),
})((req, ctx) => {
  const { dataset_id } = req.commonParams

  const dataset = ctx.db
    .getState()
    .datasets.find((d) => d.dataset_id === dataset_id)

  if (!dataset) {
    return ctx.error(404, {
      error_code: "dataset_not_found",
      message: `Dataset not found: ${dataset_id}`,
    })
  }

  return ctx.json({ dataset })
})
