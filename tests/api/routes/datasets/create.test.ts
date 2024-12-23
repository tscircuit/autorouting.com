import type { Dataset } from "@/api/lib/db/schema"
import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("POST /datasets/create should create a new dataset", async () => {
  const { testUserKy } = await getTestServer()
  const res = await testUserKy
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
    "dataset_id": "dataset-3",
    "dataset_name": "test-dataset",
    "dataset_name_with_owner": "test-user/test-dataset",
    "description_md": "Test dataset description",
    "is_processing": false,
    "max_layer_count": 4,
    "median_trace_count": 15,
    "owner_name": "test-user",
    "registry_account_id": "test-account-id",
    "sample_count": 0,
    "star_count": 0,
    "version": "1.0.0",
  },
}
`)

  // Verify the dataset was actually added to the database
  const { datasets } = await testUserKy
    .get<{ datasets: Dataset[] }>("datasets/list")
    .json()
  const createdDataset = datasets.find((d) => d.dataset_name === "test-dataset")
  expect(createdDataset).toBeDefined()
})
