import type { KyInstance } from "ky"
import { stat } from "fs/promises"
import { join } from "path/posix"
import { glob } from "glob"
import Debug from "debug"
import { processCircuitFile } from "./process-circuit-file"
import { processCircuitFileLocally } from "./process-circuit-file-locally"

const debug = Debug("autorouting:cli/run/run-autorouter")

interface RunAutorouterOptions {
  inputPath: string
  autorouter: string
  isDataset?: boolean
  ky?: KyInstance
  serverUrl?: string
  isLocal?: boolean
}

export async function runAutorouter({
  inputPath,
  autorouter,
  isDataset = false,
  serverUrl = "https://registry-api.tscircuit.com",
  isLocal = false,
}: RunAutorouterOptions) {
  if (autorouter !== "freerouting") {
    throw new Error(`Unsupported autorouter: ${autorouter}`)
  }
  if (!isDataset) {
    debug(`Processing single file: ${inputPath}`)
    isLocal
      ? await processCircuitFileLocally(inputPath)
      : await processCircuitFile({ inputPath, autorouter, serverUrl })
    return
  }
  debug(`Processing dataset: ${inputPath}`)

  // Get all sample folders
  const sampleFolders = await glob("sample*/", {
    // Added trailing slash to match directories
    cwd: inputPath,
    absolute: true,
  })

  debug(`Found ${sampleFolders.length} sample folders`)

  // Process each sample folder
  for (const sampleFolder of sampleFolders) {
    // Check if this sample folder has an unrouted_circuit.json
    const unroutedCircuitPath = join(sampleFolder, "unrouted_circuit.json")

    try {
      const stats = await stat(unroutedCircuitPath)
      if (stats.isFile()) {
        debug(`Processing sample folder: ${sampleFolder}`)

        // Process the circuit file
        isLocal
          ? await processCircuitFileLocally(unroutedCircuitPath)
          : await processCircuitFile({
              inputPath: unroutedCircuitPath,
              autorouter,
              serverUrl,
            })
      }
    } catch (error) {
      debug(`Skipping ${sampleFolder} - no unrouted_circuit.json found`)
      continue
    }
  }
}
