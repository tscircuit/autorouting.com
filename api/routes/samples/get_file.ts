import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { sampleFileSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  commonParams: z.object({
    sample_id: z.string(),
    file_path: z.string(),
  }),
  jsonResponse: z.object({
    sample_file: sampleFileSchema,
  }),
})((req, ctx) => {
  const { sample_id, file_path } = req.commonParams

  // First verify the sample exists
  const sample = ctx.db
    .getState()
    .samples.find((s) => s.sample_id === sample_id)

  if (!sample) {
    return ctx.error(404, {
      error_code: "sample_not_found",
      message: `Sample not found: ${sample_id}`,
    })
  }

  // Then find the sample file
  const sample_file = ctx.db
    .getState()
    .sample_files.find(
      (f) => f.sample_id === sample_id && f.file_path === file_path,
    )

  if (!sample_file) {
    return ctx.error(404, {
      error_code: "sample_file_not_found",
      message: `Sample file not found: sample=${sample_id} path=${file_path}`,
    })
  }

  return ctx.json({ sample_file })
})
