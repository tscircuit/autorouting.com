import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST", "DELETE"],
  commonParams: z.object({
    sample_id: z.string(),
    file_path: z.string(),
  }),
  auth: "session",
  jsonResponse: z.object({
    success: z.boolean(),
    delete_result: z.object({
      files_deleted: z.number(),
    }),
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

  // Find the file
  const sampleFile = ctx.db
    .getState()
    .sample_files.find(
      (f) => f.sample_id === sample_id && f.file_path === file_path,
    )

  if (!sampleFile) {
    return ctx.error(404, {
      error_code: "sample_file_not_found",
      message: `Sample file not found: sample=${sample_id} path=${file_path}`,
    })
  }

  // Remove the file from the database
  ctx.db.setState((state) => {
    state.sample_files = state.sample_files.filter(
      (f) => !(f.sample_id === sample_id && f.file_path === file_path),
    )
    return state
  })

  return ctx.json({
    success: true,
    delete_result: {
      files_deleted: 1,
    },
  })
})
