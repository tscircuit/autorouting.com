import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { temporaryDirectory } from "tempy"
import { uploadDatasetOutputs } from "@/cli/upload/upload-dataset-outputs"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path/posix"

it("should upload dataset outputs to the server", async () => {
  const { ky } = await getTestServer()
  const tempDir = temporaryDirectory()

  // Create a test dataset structure
  const datasetDir = join(tempDir, "testuser.custom-keyboards")
  const sampleDir = join(datasetDir, "sample1")
  const outputsDir = join(sampleDir, "outputs")
  await mkdir(outputsDir, { recursive: true })

  // Create a test output file
  const outputFile = {
    type: "pcb_trace",
    points: [
      [0, 0],
      [1, 1],
    ],
    width: 0.5,
  }
  await writeFile(
    join(outputsDir, "freerouting_routed_circuit.json"),
    JSON.stringify([outputFile], null, 2),
  )

  // Upload the dataset outputs
  await uploadDatasetOutputs({
    datasetDirectory: datasetDir,
    ky,
  })

  // Verify the upload by trying to download the file back
  const response = await ky
    .get("samples/view_file", {
      searchParams: {
        dataset_name_with_owner: "testuser/custom-keyboards",
        sample_number: 1,
        file_path: "outputs/freerouting_routed_circuit.json",
      },
    })
    .text()

  // Check the downloaded content matches what we uploaded
  const downloadedFile = JSON.parse(response)
  expect(downloadedFile).toEqual([outputFile])
})

it("should handle invalid dataset directory", async () => {
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

it("should skip already uploaded files", async () => {
  const { ky } = await getTestServer()
  const tempDir = temporaryDirectory()

  // Create dataset with multiple samples
  const datasetDir = join(tempDir, "testuser.custom-keyboards")

  // Create sample1 with new file
  const sample1Dir = join(datasetDir, "sample1", "outputs")
  await mkdir(sample1Dir, { recursive: true })
  await writeFile(
    join(sample1Dir, "freerouting_routed_circuit.json"),
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

  // Create sample2 with existing file
  const sample2Dir = join(datasetDir, "sample2", "outputs")
  await mkdir(sample2Dir, { recursive: true })
  await writeFile(
    join(sample2Dir, "freerouting_routed_circuit.json"),
    JSON.stringify([
      {
        type: "pcb_trace",
        points: [
          [2, 2],
          [3, 3],
        ],
      },
    ]),
  )

  // First upload to create existing files
  await uploadDatasetOutputs({
    datasetDirectory: datasetDir,
    ky,
  })

  // Modify sample2 file
  await writeFile(
    join(sample2Dir, "freerouting_routed_circuit.json"),
    JSON.stringify([
      {
        type: "pcb_trace",
        points: [
          [4, 4],
          [5, 5],
        ],
      },
    ]),
  )

  // Second upload should skip existing files
  await uploadDatasetOutputs({
    datasetDirectory: datasetDir,
    ky,
  })

  // Verify sample1 file wasn't uploaded again
  const sample1File = await ky
    .get("samples/view_file", {
      searchParams: {
        dataset_name_with_owner: "testuser/custom-keyboards",
        sample_number: 1,
        file_path: "outputs/freerouting_routed_circuit.json",
      },
    })
    .text()

  expect(JSON.parse(sample1File)).toEqual([
    {
      type: "pcb_trace",
      points: [
        [0, 0],
        [1, 1],
      ],
    },
  ])
})
