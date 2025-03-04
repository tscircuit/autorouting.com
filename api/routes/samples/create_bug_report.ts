import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    sample_name: z.string(),
    simple_route_json: z.any(),
  }),
  jsonResponse: z.object({
    bug_report: z.object({
      sample_url: z.string(),
    }),
  }),
})(async (req, ctx) => {
  const db = ctx.db

  // Find or create a dataset for this user called "bug-reports"
  let dataset = db
    .getState()
    .datasets.find(
      (d) =>
        d.dataset_name === "bug-reports" &&
        d.owner_name === ctx.auth.github_username,
    )

  if (!dataset) {
    // Create a new dataset for bug reports
    const newDataset = {
      dataset_id: `dataset-${db.getState().datasets.length + 1}`,
      dataset_name: "bug-reports",
      dataset_name_with_owner: `${ctx.auth.github_username}/bug-reports`,
      owner_name: ctx.auth.github_username,
      sample_count: 0,
      median_trace_count: 1,
      max_layer_count: 2,
      star_count: 0,
      is_processing: false,
      version: "1.0.0",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add the dataset to our local DB state
    db.setState((state) => {
      state.datasets.push(newDataset)
      return state
    })

    dataset = newDataset
  }

  // Get highest sample number
  const samplesInDataset = db
    .getState()
    .samples.filter((s) => s.dataset_id === dataset.dataset_id)

  const highestSampleNumber =
    samplesInDataset.length > 0
      ? Math.max(...samplesInDataset.map((s) => s.sample_number))
      : 0

  // Create a new sample in the dataset
  const newSample = {
    sample_id: `sample-${db.getState().samples.length + 1}`,
    dataset_id: dataset.dataset_id,
    sample_number: highestSampleNumber + 1,
    created_at: new Date().toISOString(),
  }

  // Add the sample to our local DB state
  db.setState((state) => {
    state.samples.push(newSample)
    return state
  })

  // Store the route JSON as a sample file
  const newSampleFile = {
    sample_file_id: `sample-file-${db.getState().sample_files.length + 1}`,
    sample_id: newSample.sample_id,
    dataset_id: dataset.dataset_id,
    file_path: "route.json",
    mimetype: "application/json",
    text_content: JSON.stringify(req.jsonBody.simple_route_json),
    created_at: new Date().toISOString(),
  }

  // Add the sample file to our local DB state
  db.setState((state) => {
    state.sample_files.push(newSampleFile)
    return state
  })

  // Update the dataset's sample count
  db.setState((state) => {
    const datasetToUpdate = state.datasets.find(
      (d) => d.dataset_id === dataset.dataset_id,
    )
    if (datasetToUpdate) {
      datasetToUpdate.sample_count = state.samples.filter(
        (s) => s.dataset_id === dataset.dataset_id,
      ).length
      datasetToUpdate.updated_at = new Date().toISOString()
    }
    return state
  })

  const serverUrl = "http://localhost:3091"

  return ctx.json({
    bug_report: {
      sample_url: `${serverUrl}/samples/view_file?sample_id=${newSample.sample_id}&file_path=route.json`,
    },
  })
})
