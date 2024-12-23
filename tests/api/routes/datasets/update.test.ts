import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("POST /datasets/update should update dataset processing status", async () => {
  const { ky } = await getTestServer()

  // First verify the dataset exists and is processing
  const initialRes = await ky
    .get("datasets/get", {
      searchParams: {
        dataset_id: "dataset-1",
      },
    })
    .json()
  expect(initialRes.dataset.is_processing).toBe(undefined)

  // Update the processing status
  const updateRes = await ky
    .post("datasets/update", {
      json: {
        dataset_id: "dataset-1",
        is_processing: false,
      },
    })
    .json()

  expect(replaceTimestamps(updateRes)).toMatchInlineSnapshot(`
{
  "dataset": {
    "created_at": "[timestamp]",
    "dataset_id": "dataset-1", 
    "dataset_name": "custom-keyboards",
    "dataset_name_with_owner": "testuser/custom-keyboards",
    "is_processing": false,
    "max_layer_count": 2,
    "median_trace_count": 10,
    "owner_name": "testuser",
    "sample_count": 3,
    "star_count": 0,
  },
}
`)

  // Verify the change was persisted
  const finalRes = await ky
    .get("datasets/get", {
      searchParams: {
        dataset_id: "dataset-1",
      },
    })
    .json()
  expect(finalRes.dataset.is_processing).toBe(false)
})

it("POST /datasets/update should return 404 for non-existent dataset", async () => {
  const { ky } = await getTestServer()

  try {
    await ky
      .post("datasets/update", {
        json: {
          dataset_id: "non-existent",
          is_processing: false,
        },
      })
      .json()
    expect(false).toBe(true) // Should not reach here
  } catch (error: any) {
    expect(error.response.status).toBe(404)
    const errorData = await error.response.json()
    expect(errorData.error.error_code).toBe("dataset_not_found")
  }
})
