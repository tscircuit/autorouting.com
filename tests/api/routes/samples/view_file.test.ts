import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"

it("GET /samples/view_file should return file content with correct mimetype", async () => {
  const { ky } = await getTestServer()
  const response = await ky
    .get("samples/view_file", {
      searchParams: {
        sample_id: "sample-1",
        file_path: "circuit.json",
      },
    })

  expect(response.headers.get("Content-Type")).toBe("application/json")
  expect(response.headers.has("Content-Disposition")).toBe(false)
  
  const content = await response.text()
  expect(content).toBeDefined()
  expect(content.length).toBeGreaterThan(0)
})

it("GET /samples/view_file with download=true should set Content-Disposition", async () => {
  const { ky } = await getTestServer()
  const response = await ky
    .get("samples/view_file", {
      searchParams: {
        sample_id: "sample-1",
        file_path: "circuit.json",
        download: true,
      },
    })

  expect(response.headers.get("Content-Type")).toBe("application/json")
  expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="circuit.json"')
  
  const content = await response.text()
  expect(content).toBeDefined()
  expect(content.length).toBeGreaterThan(0)
})

it("GET /samples/view_file should return 404 for non-existent sample", async () => {
  const { ky } = await getTestServer()

  try {
    await ky
      .get("samples/view_file", {
        searchParams: {
          sample_id: "non-existent",
          file_path: "circuit.json",
        },
      })
    expect(false).toBe(true) // Should not reach here
  } catch (error: any) {
    expect(error.response.status).toBe(404)
    const errorData = await error.response.json()
    expect(errorData.error.error_code).toBe("sample_not_found")
  }
})

it("GET /samples/view_file should return 404 for non-existent file", async () => {
  const { ky } = await getTestServer()

  try {
    await ky
      .get("samples/view_file", {
        searchParams: {
          sample_id: "sample-1",
          file_path: "non-existent.json",
        },
      })
    expect(false).toBe(true) // Should not reach here
  } catch (error: any) {
    expect(error.response.status).toBe(404)
    const errorData = await error.response.json()
    expect(errorData.error.error_code).toBe("sample_file_not_found")
  }
})

it("GET /samples/view_file should return 404 for file without content", async () => {
  const { ky } = await getTestServer()

  // Assuming there's a file without content in the test database
  try {
    await ky
      .get("samples/view_file", {
        searchParams: {
          sample_id: "sample-1",
          file_path: "empty.json",
        },
      })
    expect(false).toBe(true) // Should not reach here
  } catch (error: any) {
    expect(error.response.status).toBe(404)
    const errorData = await error.response.json()
    expect(errorData.error.error_code).toBe("sample_file_not_found")
  }
})
