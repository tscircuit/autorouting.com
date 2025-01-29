import { expect, test } from "bun:test"
import { temporaryDirectory } from "tempy"
import { runAutorouter } from "@/cli/run/run-autorouter"
import { existsSync } from "fs"
import { join } from "path/posix"
import { writeFile, mkdir } from "fs/promises"
import unroutedCircuit from "tests/fixtures/unrouted_circuit.json"

const createMockCircuitFile = async (dir: string) => {
  const mockCircuit = unroutedCircuit
  await writeFile(
    join(dir, "unrouted_circuit.json"),
    JSON.stringify(mockCircuit, null, 2),
  )
}

test("should handle dataset with missing circuit files using local server", async () => {
  expect.assertions(4)
  // Create a temporary dataset directory structure
  const datasetDir = temporaryDirectory()

  // Create sample folders - some with circuit files, some without
  const samplesWithCircuit = ["sample1", "sample3"]
  const samplesWithoutCircuit = ["sample2", "sample4"]

  // Create folders with circuit files
  for (const sampleDir of samplesWithCircuit) {
    const fullSamplePath = join(datasetDir, sampleDir)
    await mkdir(fullSamplePath, { recursive: true })
    await createMockCircuitFile(fullSamplePath)
  }

  // Create folders without circuit files
  for (const sampleDir of samplesWithoutCircuit) {
    const fullSamplePath = join(datasetDir, sampleDir)
    await mkdir(fullSamplePath, { recursive: true })
  }

  // Run autorouter
  await runAutorouter({
    inputPath: datasetDir,
    autorouter: "freerouting",
    isDataset: true,
    serverUrl: "http://localhost:3000",
    isLocal: true,
  })

  // Check folders that should have output
  for (const sampleDir of samplesWithCircuit) {
    const outputPath = join(
      datasetDir,
      sampleDir,
      "outputs",
      "freerouting_routed_circuit.json",
    )
    expect(existsSync(outputPath)).toBe(true)
  }

  // Check folders that should not have output
  for (const sampleDir of samplesWithoutCircuit) {
    const outputPath = join(
      datasetDir,
      sampleDir,
      "outputs",
      "freerouting_routed_circuit.json",
    )
    expect(existsSync(outputPath)).toBe(false)
  }
}, 30000) // Increase timeout to 30 seconds
