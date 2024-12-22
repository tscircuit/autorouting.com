import type { Sample } from "@/api/lib/db/schema"
import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("POST /samples/create should create a new sample", async () => {
  const { ky } = await getTestServer()
  const res = await ky
    .post("samples/create", {
      json: {
        dataset_id: "dataset-1",
        sample_number: 4,
      },
    })
    .json()

  expect(replaceTimestamps(res)).toMatchInlineSnapshot(`
{
  "sample": {
    "created_at": "[timestamp]",
    "dataset_id": "dataset-1",
    "sample_id": "sample-4",
    "sample_number": 4,
  },
}
`)

  // Verify the sample was actually added to the database
  const sampleRes = await ky
    .get<{ sample: Sample }>("samples/get", {
      searchParams: {
        dataset_id: "dataset-1",
        sample_number: 4,
      },
    })
    .json()

  expect(sampleRes.sample.sample_number).toBe(4)
})
