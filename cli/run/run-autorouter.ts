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
  const [result, error] = await (async () => {
    if (autorouter !== "freerouting") {
      return [null, new Error(`Unsupported autorouter: ${autorouter}`)] as const
    }

    if (!isDataset) {
      debug(`Processing single file: ${inputPath}`)
      const [, processError] = await (isLocal
        ? processCircuitFileLocally(inputPath)
        : processCircuitFile({ inputPath, autorouter, serverUrl })
      )
        .then(() => [true, null] as const)
        .catch((err) => [null, err] as const)

      if (processError) {
        return [
          null,
          new Error(`Failed to process circuit file: ${processError.message}`),
        ] as const
      }
      return [true, null] as const
    }

    debug(`Processing dataset: ${inputPath}`)

    // Get all sample folders
    const [sampleFolders, globError] = await glob("sample*/", {
      cwd: inputPath,
      absolute: true,
    })
      .then((folders) => [folders, null] as const)
      .catch((err) => [null, err] as const)

    if (globError) {
      return [
        null,
        new Error(`Failed to list sample folders: ${globError.message}`),
      ] as const
    }

    debug(`Found ${sampleFolders!.length} sample folders`)

    // Process each sample folder
    for (const sampleFolder of sampleFolders!) {
      const unroutedCircuitPath = join(sampleFolder, "unrouted_circuit.json")

      const [stats, statError] = await stat(unroutedCircuitPath)
        .then((s) => [s, null] as const)
        .catch((err) => [null, err] as const)

      if (statError) {
        debug(`Skipping ${sampleFolder} - no unrouted_circuit.json found`)
        continue
      }

      if (stats!.isFile()) {
        debug(`Processing sample folder: ${sampleFolder}`)

        const [, processError] = await (isLocal
          ? processCircuitFileLocally(unroutedCircuitPath)
          : processCircuitFile({
              inputPath: unroutedCircuitPath,
              autorouter,
              serverUrl,
            })
        )
          .then(() => [true, null] as const)
          .catch((err) => [null, err] as const)

        if (processError) {
          return [
            null,
            new Error(
              `Failed to process sample ${sampleFolder}: ${processError.message}`,
            ),
          ] as const
        }
      }
    }

    return [true, null] as const
  })()

  if (error) {
    debug(`Error running autorouter: ${error.message}`)
    throw error
  }
}
