import { test, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { temporaryDirectory } from "tempy"
import { uploadDatasetOutputs } from "@/cli/upload/upload-dataset-outputs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path/posix"

test("should upload dataset outputs to the server", async () => {
  const { ky } = await getTestServer()
  const tempDir = temporaryDirectory()

  // Create a test dataset structure
  const datasetDir = join(tempDir, "testuser.custom-keyboards")
  const sampleDirs = ["sample1", "sample2"]
  
  for (const sampleDir of sampleDirs) {
    const outputsDir = join(datasetDir, sampleDir, "outputs")
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
  }

  // Upload the dataset outputs
  await uploadDatasetOutputs({
    datasetDirectory: datasetDir,
    ky: ky,
  })

  // Verify uploads for each sample
  for (let sampleNumber = 1; sampleNumber <= sampleDirs.length; sampleNumber++) {
    const response = await ky
      .get("samples/view_file", {
        searchParams: {
          dataset_id: "dataset-1",
          sample_number: sampleNumber,
          file_path: "freerouting_routed_circuit.json",
        },
      })
      .text()

    const downloadedFile = JSON.parse(response)
    expect(downloadedFile).toEqual([{
      type: "pcb_trace",
      points: [[0, 0], [1, 1]],
      width: 0.5,
    }])
  }
})
