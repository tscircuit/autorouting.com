import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { sampleFileSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    sample_id: z.string(),
    file_path: z.string(),
    mimetype: z.string(),
    text_content: z.string(),
  }),
  jsonResponse: z.object({
    sample_file: sampleFileSchema,
  }),
})((req, ctx) => {
  const { sample_id, file_path, mimetype, text_content } = req.jsonBody

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

  // Find the existing file
  const existingFile = ctx.db
    .getState()
    .sample_files.find(
      (f) => f.sample_id === sample_id && f.file_path === file_path
    )

  if (!existingFile) {
    return ctx.error(404, {
      error_code: "sample_file_not_found",
      message: `Sample file not found: sample=${sample_id} path=${file_path}`,
    })
  }

  // Update the file
  ctx.db.setState((state) => {
    const fileIndex = state.sample_files.findIndex(
      (f) => f.sample_id === sample_id && f.file_path === file_path
    )
    if (fileIndex !== -1) {
      state.sample_files[fileIndex] = {
        ...existingFile,
        mimetype,
        text_content,
      }
    }
    return state
  })

  // Get the updated file
  const updatedFile = ctx.db
    .getState()
    .sample_files.find(
      (f) => f.sample_id === sample_id && f.file_path === file_path
    )!

  return ctx.json({ sample_file: updatedFile })
})