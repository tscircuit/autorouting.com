import { expect, test } from "bun:test"
import { temporaryDirectory } from "tempy"
import { runAutorouter } from "@/cli/run/run-autorouter"
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
