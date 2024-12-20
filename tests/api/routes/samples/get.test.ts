import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("GET /samples/get", async () => {
  const { ky } = await getTestServer()
  const res = await ky
    .get("samples/get", {
      searchParams: {
        dataset_id: "dataset-1",
        sample_number: 1,
      },
    })
    .json()

  expect(replaceTimestamps(res)).toMatchInlineSnapshot(`
{
  "sample": {
    "created_at": "[timestamp]",
    "dataset_id": "dataset-1",
    "sample_id": "sample-1",
    "sample_number": 1,
  },
}
`)
})

it("GET /samples/get should return 404 for non-existent dataset", async () => {
  const { ky } = await getTestServer()

  try {
    await ky
      .get("samples/get", {
        searchParams: {
          dataset_id: "non-existent",
          sample_number: 1,
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

it("GET /samples/get should return 404 for non-existent sample", async () => {
  const { ky } = await getTestServer()

  try {
    await ky
      .get("samples/get", {
        searchParams: {
          dataset_id: "dataset-1",
          sample_number: 999,
        },
      })
      .json()
    expect(false).toBe(true) // Should not reach here
  } catch (error: any) {
    expect(error.response.status).toBe(404)
    const errorData = await error.response.json()
    expect(errorData.error.error_code).toBe("sample_not_found")
  }
})
