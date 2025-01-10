import { it, expect } from "bun:test"
import { getTestServer } from "tests/fixtures/get-test-server"
import { temporaryDirectory } from "tempy"
import { downloadDatasetToDirectory } from "@/cli/download-dataset"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

it("should download all sample files from a dataset", async () => {
  const { ky } = await getTestServer()
  const tempDir = temporaryDirectory()

  await downloadDatasetToDirectory({
    datasetNameWithOwner: "testuser/custom-keyboards",
    outputDirectory: tempDir,
    ky,
  })

  // Check directory structure
  const datasetDir = join(tempDir, "testuser.custom-keyboards")
  expect(existsSync(datasetDir)).toBe(true)

  // Check sample1 directory and files
  const sample1Dir = join(datasetDir, "sample1")
  expect(existsSync(sample1Dir)).toBe(true)
  expect(existsSync(join(sample1Dir, "unrouted_circuit.json"))).toBe(true)
  expect(existsSync(join(sample1Dir, "unrouted_pcb.svg"))).toBe(true)

  // Verify content of a file
  const circuitJson = readFileSync(
    join(sample1Dir, "unrouted_circuit.json"),
    "utf8",
  )
  expect(JSON.parse(circuitJson)).toBeDefined()
})
