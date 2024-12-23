import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { sampleFileSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
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

  // Create the sample file
  const newSampleFile = {
    sample_file_id: `sample-file-${ctx.db.getState().sample_files.length + 1}`,
    dataset_id: sample.dataset_id,
    sample_id,
    file_path,
    mimetype,
    text_content,
    created_at: new Date().toISOString(),
  }

  // Add to our local DB state
  ctx.db.setState((state) => {
    state.sample_files.push(newSampleFile)
    return state
  })

  return ctx.json({ sample_file: newSampleFile })
})
