import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

declare module "bun:test" {
  interface Matchers<T = unknown> {
    toMatchInlineSnapshot(snapshot?: string | null): Promise<MatcherResult>
  }
}

it("GET /datasets/get", async () => {
  const { ky } = await getTestServer()
  const res = await ky
    .get("datasets/get", {
      searchParams: {
        dataset_id: "dataset-1",
      },
    })
    .json()

  expect(replaceTimestamps(res)).toMatchInlineSnapshot(`
{
  "dataset": {
    "created_at": "[timestamp]",
    "dataset_id": "dataset-1",
    "dataset_name": "custom-keyboards",
    "dataset_name_with_owner": "testuser/custom-keyboards",
    "max_layer_count": 10,
    "median_trace_count": 10,
    "owner_name": "testuser",
    "sample_count": 1,
  },
}
`)
})
