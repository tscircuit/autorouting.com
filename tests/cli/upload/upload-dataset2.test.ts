import { test, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { temporaryDirectory } from "tempy"
import { uploadDatasetOutputs } from "@/cli/upload/upload-dataset-outputs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path/posix"

test("should skip already uploaded files", async () => {
  const { ky } = await getTestServer()
  const tempDir = temporaryDirectory()
  const datasetDir = join(tempDir, "testuser.custom-keyboards")

  // Create samples with output files
  for (const sampleDir of ["sample1", "sample2"]) {
    const outputsDir = join(datasetDir, sampleDir, "outputs")
    await mkdir(outputsDir, { recursive: true })

    await writeFile(
      join(outputsDir, "freerouting_routed_circuit.json"),
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
  }

  // First upload
  await uploadDatasetOutputs({
    datasetDirectory: datasetDir,
    ky,
  })

  // Modify sample2 file
  await writeFile(
    join(datasetDir, "sample2", "outputs", "freerouting_routed_circuit.json"),
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

  // Second upload should skip existing files
  await uploadDatasetOutputs({
    datasetDirectory: datasetDir,
    ky,
  })

  // Verify sample1 file wasn't changed
  // Get dataset ID first
  const { dataset } = await ky
    .get("datasets/get", {
      searchParams: {
        dataset_name_with_owner: "testuser/custom-keyboards",
      },
    })
    .json<{ dataset: { dataset_id: string } }>()

  const sample1Response = await ky
    .get("samples/view_file", {
      searchParams: {
        dataset_id: dataset.dataset_id,
        sample_number: 1,
        file_path: "freerouting_routed_circuit.json",
      },
    })
    .text()

  expect(JSON.parse(sample1Response)).toEqual([
    {
      type: "pcb_trace",
      points: [
        [0, 0],
        [1, 1],
      ],
    },
  ])
})
