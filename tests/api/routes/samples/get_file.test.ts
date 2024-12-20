import { replaceTimestamps } from "@/tests/fixtures/replace-timestamps"
import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("GET /samples/get_file", async () => {
  const { ky } = await getTestServer()
  const res = await ky
    .get<any>("samples/get_file", {
      searchParams: {
        sample_id: "sample-1",
        file_path: "circuit.json",
      },
    })
    .json()

  expect(res.sample_file.text_content).toBeDefined()
})

it("GET /samples/get_file should return 404 for non-existent sample", async () => {
  const { ky } = await getTestServer()

  try {
    await ky
      .get("samples/get_file", {
        searchParams: {
          sample_id: "non-existent",
          file_path: "circuit.json",
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

it("GET /samples/get_file should return 404 for non-existent file", async () => {
  const { ky } = await getTestServer()

  try {
    await ky
      .get("samples/get_file", {
        searchParams: {
          sample_id: "sample-1",
          file_path: "non-existent.json",
        },
      })
      .json()
    expect(false).toBe(true) // Should not reach here
  } catch (error: any) {
    expect(error.response.status).toBe(404)
    const errorData = await error.response.json()
    expect(errorData.error.error_code).toBe("sample_file_not_found")
  }
})
