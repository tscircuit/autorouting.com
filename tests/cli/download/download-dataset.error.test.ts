import { it, expect, describe } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { temporaryDirectory } from "tempy"
import { downloadDatasetToDirectory } from "@/cli/download/download-dataset"
import { join } from "path"

describe("downloadDatasetToDirectory error cases", () => {
  it("should return error for non-existent dataset", async () => {
    const { ky } = await getTestServer()
    const tempDir = temporaryDirectory()

    const [result, error] = await downloadDatasetToDirectory({
      datasetNameWithOwner: "nonexistent/dataset",
      outputDirectory: tempDir,
      ky,
    })

    expect(result).toBe(null)
    expect(error).toBeDefined()
    expect(error?.message).toContain(
      'Failed to fetch dataset "nonexistent/dataset"',
    )
    expect(error?.message).toContain(
      "Please check if the dataset exists and you have access to it",
    )
    expect(error?.message).toContain("Original error")
  })

  it("should return error for invalid output directory", async () => {
    const { ky } = await getTestServer()

    const invalidDir = join(
      "/",
      "nonexistent",
      "path",
      "that",
      "should",
      "fail",
    )

    const [result, error] = await downloadDatasetToDirectory({
      datasetNameWithOwner: "testuser/custom-keyboards",
      outputDirectory: invalidDir,
      ky,
    })

    expect(result).toBe(null)
    expect(error).toBeDefined()
    expect(error?.message).toContain("Failed to create dataset directory")
    expect(error?.message).toContain("Original error")
  })

  it("should return error for failed file download", async () => {
    const tempDir = temporaryDirectory()

    const [result, error] = await downloadDatasetToDirectory({
      datasetNameWithOwner: "testuser/custom-keyboards",
      outputDirectory: tempDir,
    })

    expect(result).toBe(null)
    expect(error).toBeDefined()
    expect(error?.message).toContain(
      'Failed to fetch dataset "testuser/custom-keyboards". Please check if the dataset exists and you have access to it. Original error: Unable to connect. Is the computer able to access the url?',
    )
  })
})
