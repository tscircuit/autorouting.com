import { test, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { temporaryDirectory } from "tempy"
import { uploadDatasetOutputs } from "@/cli/upload/upload-dataset-outputs"
import { mkdir } from "fs/promises"
import { join } from "path/posix"

test("should handle invalid dataset directory", async () => {
  const { ky } = await getTestServer()
  const tempDir = temporaryDirectory()

  // Create directory with invalid name format
  const invalidDir = join(tempDir, "invalid-format")
  await mkdir(invalidDir, { recursive: true })

  // Attempt upload should fail
  await expect(
    uploadDatasetOutputs({
      datasetDirectory: invalidDir,
      ky,
    }),
  ).rejects.toThrow("Invalid dataset directory name format")
})
