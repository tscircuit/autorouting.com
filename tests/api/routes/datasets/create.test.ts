import type { Dataset } from "@/api/lib/db/schema"
import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("POST /datasets/create should create a new dataset", async () => {
  const { ky } = await getTestServer()
  const res = await ky
    .post("datasets/create", {
      json: {
        dataset_name: "test-dataset",
        median_trace_count: 15,
        max_layer_count: 4,
        license_type: "MIT",
        description_md: "Test dataset description",
        github_url: "https://github.com/test/test-dataset",
        website_url: "https://test-dataset.com",
      },
    })
    .json()

  expect(replaceTimestamps(res)).toMatchInlineSnapshot(`
{
  "dataset": {
    "created_at": "[timestamp]",
    "dataset_id": "ab05b846-37ab-4dd9-a1a6-bce7ac0a9e4b",
    "dataset_name": "test-dataset",
    "dataset_name_with_owner": "test-user/test-dataset",
    "description_md": "Test dataset description",
    "max_layer_count": 4,
    "median_trace_count": 15,
    "owner_name": "test-user",
    "sample_count": 0,
    "star_count": 0,
    "version": "1.0.0",
  },
}
`)

  // Verify the dataset was actually added to the database
  const { datasets } = await ky
    .get<{ datasets: Dataset[] }>("datasets/list")
    .json()
  const createdDataset = datasets.find((d) => d.dataset_name === "test-dataset")
  expect(createdDataset).toBeDefined()
})
