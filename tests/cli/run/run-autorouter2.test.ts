import { expect, test } from "bun:test"
import { temporaryDirectory } from "tempy"
import { runAutorouter } from "@/cli/run/run-autorouter"
import { existsSync, readFileSync } from "fs"
import { join } from "path/posix"
import { writeFile, mkdir } from "fs/promises"
import type { AnyCircuitElement } from "circuit-json"
import unroutedCircuit from "../../fixtures/unrouted_circuit.json"

const createMockCircuitFile = async (dir: string) => {
  const mockCircuit = unroutedCircuit
  await writeFile(
    join(dir, "unrouted_circuit.json"),
    JSON.stringify(mockCircuit, null, 2),
  )
}

test("should run autorouter on a dataset directory", async () => {
  // Create a temporary dataset directory structure
  const datasetDir = temporaryDirectory()

  // Create multiple sample folders
  const sampleDirs = ["sample1", "sample2"] // Reduced to 2 samples to speed up test
  for (const sampleDir of sampleDirs) {
    const fullSamplePath = join(datasetDir, sampleDir)
    await mkdir(fullSamplePath, { recursive: true })
    await createMockCircuitFile(fullSamplePath)
  }

  // Run command
  await runAutorouter({
    inputPath: datasetDir,
    autorouter: "freerouting",
    isDataset: true,
    serverUrl: "https://registry-api.tscircuit.com",
  })

  // Check each sample folder
  for (const sampleDir of sampleDirs) {
    const outputPath = join(
      datasetDir,
      sampleDir,
      "outputs",
      "freerouting_routed_circuit.json",
    )
    expect(existsSync(outputPath)).toBe(true)

    const outputJson: AnyCircuitElement[] = JSON.parse(
      readFileSync(outputPath, "utf8"),
    )
    expect(Array.isArray(outputJson)).toBe(true)
    expect(outputJson.some((item) => item.type !== "pcb_trace")).toBe(true)
    expect(outputJson.some((item) => item.type === "pcb_trace")).toBe(true)
  }
}, 15000)
