import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { sampleSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
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

  // Then find the sample
  const sample = ctx.db
    .getState()
    .samples.find(
      (s) => s.dataset_id === dataset_id && s.sample_number === sample_number,
    )

  if (!sample) {
    return ctx.error(404, {
      error_code: "sample_not_found",
      message: `Sample not found: dataset=${dataset_id} number=${sample_number}`,
    })
  }

  const available_file_paths = ctx.db
    .getState()
    .sample_files.filter((f) => f.sample_id === sample.sample_id)
    .map((f) => f.file_path)

  return ctx.json({ sample: { ...sample, available_file_paths } })
})
