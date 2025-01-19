import { test, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { temporaryDirectory } from "tempy"
import { uploadDatasetOutputs } from "@/cli/upload/upload-dataset-outputs"
import { mkdir, writeFile, rm } from "fs/promises"
import { join } from "path/posix"

test("should delete remote files when local files are removed", async () => {
  const { ky } = await getTestServer()
  const tempDir = temporaryDirectory()
  const datasetDir = join(tempDir, "testuser.custom-keyboards")

  // Create sample with output file
  const outputsDir = join(datasetDir, "sample1", "outputs")
  await mkdir(outputsDir, { recursive: true })

  const initialFile = join(outputsDir, "freerouting_routed_circuit.json")
  await writeFile(
    initialFile,
    JSON.stringify([
      {
        type: "pcb_trace",
        points: [
          [0, 0],
          [1, 1],
        ],
      },
    ]),
  )

  // First upload
  await uploadDatasetOutputs({
    datasetDirectory: datasetDir,
    ky,
  })

  // Delete the local file
  await rm(initialFile)

  // Second upload should delete the remote file
  await uploadDatasetOutputs({
    datasetDirectory: datasetDir,
    ky,
  })

  // Get dataset ID
  const { dataset } = await ky
    .get("datasets/get", {
      searchParams: {
        dataset_name_with_owner: "testuser/custom-keyboards",
      },
    })
    .json<{ dataset: { dataset_id: string } }>()

  // Verify file was deleted
  await expect(
    ky
      .get("samples/view_file", {
        searchParams: {
          dataset_id: dataset.dataset_id,
          sample_number: 1,
          file_path: "freerouting_routed_circuit.json",
        },
      })
      .text(),
  ).rejects.toThrow()
})
