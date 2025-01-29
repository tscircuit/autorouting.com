import { routeUsingLocalFreerouting } from "freerouting"
import { readFile, writeFile, mkdir, unlink } from "fs/promises"
import { join, dirname } from "path/posix"
import { convertAndSaveCircuitToDsn } from "../utils/circuit-json-to dsn-file-converter"
import {
  parseDsnToDsnJson,
  convertDsnSessionToCircuitJson,
  type DsnPcb,
  type DsnSession,
} from "dsn-converter"
import { glob } from "glob"
import Debug from "debug"
import type { AnyCircuitElement } from "circuit-json"

const debug = Debug("autorouting:cli/run/local-freerouting")

export async function processCircuitFileLocally(inputPath: string) {
  debug(`Processing circuit file locally: ${inputPath}`)

  const sampleDir = dirname(inputPath)
  let dsnPath: string
  let circuitWithoutTraces: AnyCircuitElement[] | undefined

  // Check if input is DSN or JSON
  if (inputPath.toLowerCase().endsWith(".dsn")) {
    dsnPath = inputPath
    // For DSN files, we don't need to do initial conversion
  } else if (inputPath.toLowerCase().endsWith(".json")) {
    // Assume JSON file
    // Read and parse the input circuit
    const circuitJson = await readFile(inputPath, "utf8")
    const circuit: AnyCircuitElement[] = JSON.parse(circuitJson)

    // Filter out any existing pcb_traces from the original circuit
    circuitWithoutTraces = circuit.filter((item) => item.type !== "pcb_trace")

    // Convert circuit to DSN and save to temp file
    dsnPath = await convertAndSaveCircuitToDsn(circuitWithoutTraces)
  } else {
    throw new Error(`Unsupported file format for input file: ${inputPath}`)
  }

  try {
    // Run local freerouting
    debug(`Running freerouting on DSN file: ${dsnPath}`)
    const routedDsn = await routeUsingLocalFreerouting({ inputPath: dsnPath })

    // Read the original DSN file to get the PCB data
    const originalDsnContent = await readFile(dsnPath, "utf8")
    const pcbJson = parseDsnToDsnJson(originalDsnContent) as DsnPcb

    // Parse the routed DSN to get the session data
    const sessionJson = parseDsnToDsnJson(routedDsn) as DsnSession

    // Convert the routed DSN back to circuit JSON
    const routedTraces = convertDsnSessionToCircuitJson(pcbJson, sessionJson)

    // Combine original circuit (without traces) with new traces
    const outputCircuit = circuitWithoutTraces
      ? [...circuitWithoutTraces, ...routedTraces]
      : routedTraces

    // Write the routed circuit JSON to the outputs directory
    const outputsDir = join(sampleDir, "outputs")
    await mkdir(outputsDir, { recursive: true })
    const outputPath = join(outputsDir, "freerouting_routed_circuit.json")
    await writeFile(outputPath, JSON.stringify(outputCircuit, null, 2))

    debug(`Wrote routed circuit to: ${outputPath}`)

    // Clean up temporary DSN file
    if (!inputPath.toLowerCase().endsWith(".dsn")) {
      await unlink(dsnPath)
      debug(`Deleted temporary DSN file: ${dsnPath}`)
    }

    return outputPath
  } catch (error) {
    debug(`Error processing file ${inputPath}:`, error)
    throw error
  }
}
