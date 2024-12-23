import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { datasetSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z.object({
    dataset_id: z.string().optional(),
    dataset_name_with_owner: z.string().optional(),
  }),
  jsonResponse: z.object({
    dataset: datasetSchema,
  }),
})((req, ctx) => {
  const { dataset_id, dataset_name_with_owner } = req.commonParams

  const dataset = ctx.db
    .getState()
    .datasets.find(
      (d) =>
        d.dataset_id === dataset_id ||
        d.dataset_name_with_owner === dataset_name_with_owner,
    )

  if (!dataset) {
    return ctx.error(404, {
      error_code: "dataset_not_found",
      message: `Dataset not found: ${dataset_id}`,
    })
  }

  return ctx.json({ dataset })
})
