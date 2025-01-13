import { describe, expect, test } from "bun:test"
import { temporaryDirectory } from "tempy"
import { runAutorouter } from "@/cli/run/run-autorouter"
import { existsSync, readFileSync } from "fs"
import { join } from "path/posix"
import { writeFile, mkdir } from "fs/promises"
import type { AnyCircuitElement } from "circuit-json"
import unroutedCircuit from "../fixtures/unrouted_circuit.json"

const createMockCircuitFile = async (dir: string) => {
  const mockCircuit = unroutedCircuit
  await writeFile(
    join(dir, "unrouted_circuit.json"),
    JSON.stringify(mockCircuit, null, 2),
  )
}

describe("autorouter run", () => {
  test("should run autorouter on a single circuit file", async () => {
    // Create a temporary directory with a sample folder structure
    const tempDir = temporaryDirectory()
    const sampleDir = join(tempDir, "sample1")
    await mkdir(sampleDir, { recursive: true })
    await createMockCircuitFile(sampleDir)
    const inputPath = join(sampleDir, "unrouted_circuit.json")

    // Run command
    await runAutorouter({
      inputPath,
      autorouter: "freerouting",
      serverUrl: "https://registry-api.tscircuit.com",
    })

    // Check routed file was created in sample's outputs directory
    const outputPath = join(
      sampleDir,
      "outputs",
      "freerouting_routed_circuit.json",
    )
    console.log(outputPath)
    expect(existsSync(outputPath)).toBe(true)

    // Verify output content
    const outputJson: AnyCircuitElement[] = JSON.parse(
      readFileSync(outputPath, "utf8"),
    )
    expect(Array.isArray(outputJson)).toBe(true)
    expect(outputJson.some((item) => item.type !== "pcb_trace")).toBe(true)
    expect(outputJson.some((item) => item.type === "pcb_trace")).toBe(true)
  }, 10000) // Increase timeout to 10 seconds

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

  test("should handle dataset with missing circuit files", async () => {
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
      serverUrl: "https://registry-api.tscircuit.com",
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
  })

  test("should handle autorouter errors gracefully", async () => {
    const tempDir = temporaryDirectory()
    await createMockCircuitFile(tempDir)
    const inputPath = join(tempDir, "unrouted_circuit.json")

    // Test with invalid autorouter name
    await expect(
      runAutorouter({
        inputPath,
        autorouter: "invalid_autorouter",
        serverUrl: "https://registry-api.tscircuit.com",
      }),
    ).rejects.toThrow()
  })
})
