import { it, expect, describe } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { temporaryDirectory } from "tempy"
import { downloadDatasetToDirectory } from "@/cli/download/download-dataset"
import { join } from "path"

describe("downloadDatasetToDirectory error cases", () => {
  it("should return error for non-existent dataset", async () => {
    const { ky } = await getTestServer()
    const tempDir = temporaryDirectory()

    await expect(
      downloadDatasetToDirectory({
        datasetNameWithOwner: "nonexistent/dataset",
        outputDirectory: tempDir,
        ky,
      }),
    ).rejects.toThrow(
      /Failed to fetch dataset "nonexistent\/dataset".*Please check if the dataset exists and you have access to it.*Original error/,
    )
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

    await expect(
      downloadDatasetToDirectory({
        datasetNameWithOwner: "testuser/custom-keyboards",
        outputDirectory: invalidDir,
        ky,
      }),
    ).rejects.toThrow(/Failed to create dataset directory.*Original error/)
  })

  it("should return error for failed file download", async () => {
    const tempDir = temporaryDirectory()

    await expect(
      downloadDatasetToDirectory({
        datasetNameWithOwner: "testuser/custom-keyboards",
        outputDirectory: tempDir,
      }),
    ).rejects.toThrow(
      /Failed to fetch dataset "testuser\/custom-keyboards".*Please check if the dataset exists and you have access to it.*Original error/,
    )
  })
})
