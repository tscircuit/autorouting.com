import { test, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { temporaryDirectory } from "tempy"
import { uploadDatasetOutputs } from "@/cli/upload/upload-dataset-outputs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path/posix"

test("should update files when content changes after upload", async () => {
  const { ky } = await getTestServer()
  const tempDir = temporaryDirectory()
  const datasetDir = join(tempDir, "testuser.custom-keyboards")

  // Create sample with initial output file
  const outputsDir = join(datasetDir, "sample1", "outputs")
  await mkdir(outputsDir, { recursive: true })

  const outputFile = join(outputsDir, "freerouting_routed_circuit.json")
  await writeFile(
    outputFile,
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

  // Modify the file content
  await writeFile(
    outputFile,
    JSON.stringify([
      {
        type: "pcb_trace",
        points: [
          [5, 5],
          [10, 10],
        ],
        width: 0.8,
      },
    ]),
  )

  // Second upload should update the file
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

  // Verify file was updated with new content
  const response = await ky
    .get("samples/view_file", {
      searchParams: {
        dataset_id: dataset.dataset_id,
        sample_number: 1,
        file_path: "freerouting_routed_circuit.json",
      },
    })
    .text()

  expect(JSON.parse(response)).toEqual([
    {
      type: "pcb_trace",
      points: [
        [5, 5],
        [10, 10],
      ],
      width: 0.8,
    },
  ])
})
