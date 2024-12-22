import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST", "DELETE"],
  commonParams: z.object({
    dataset_id: z.string(),
  }),
  auth: "session",
  jsonResponse: z.object({
    success: z.boolean(),
    dataset_delete_result: z.object({
      datasets_deleted: z.number(),
      samples_deleted: z.number(),
      sample_files_deleted: z.number(),
    }),
  }),
})((req, ctx) => {
  const { dataset_id } = req.commonParams

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

  // Get all samples for this dataset
  const samples = ctx.db
    .getState()
    .samples.filter((s) => s.dataset_id === dataset_id)

  // Get all sample files for these samples
  const sampleIds = samples.map((s) => s.sample_id)
  const sampleFiles = ctx.db
    .getState()
    .sample_files.filter((f) => sampleIds.includes(f.sample_id))

  // Remove everything from the database
  ctx.db.setState((state) => {
    state.datasets = state.datasets.filter((d) => d.dataset_id !== dataset_id)
    state.samples = state.samples.filter((s) => s.dataset_id !== dataset_id)
    state.sample_files = state.sample_files.filter(
      (f) => !sampleIds.includes(f.sample_id)
    )
    return state
  })

  return ctx.json({
    success: true,
    dataset_delete_result: {
      datasets_deleted: 1,
      samples_deleted: samples.length,
      sample_files_deleted: sampleFiles.length,
    },
  })
})
