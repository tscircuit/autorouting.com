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
import Debug from "debug"
import type { AnyCircuitElement } from "circuit-json"

const debug = Debug("autorouting:cli/run/local-freerouting")

export async function processCircuitFileLocally(inputPath: string) {
  debug(`Processing circuit file locally: ${inputPath}`)

  const [result, error] = await (async () => {
    const sampleDir = dirname(inputPath)
    let dsnPath: string
    let circuitWithoutTraces: AnyCircuitElement[] | undefined

    // Check if input is DSN or JSON
    if (
      !inputPath.toLowerCase().endsWith(".dsn") &&
      !inputPath.toLowerCase().endsWith(".json")
    ) {
      return [
        null,
        new Error(`Unsupported file format for input file: ${inputPath}`),
      ] as const
    }

    if (inputPath.toLowerCase().endsWith(".json")) {
      // Read and parse the input circuit
      const [circuitJson, readError] = await readFile(inputPath, "utf8")
        .then((data) => [data, null] as const)
        .catch((err) => [null, err] as const)

      if (readError) {
        return [
          null,
          new Error(`Failed to read input file: ${readError.message}`),
        ] as const
      }

      let circuit: AnyCircuitElement[]
      try {
        circuit = JSON.parse(circuitJson!)
      } catch (err: any) {
        return [
          null,
          new Error(`Failed to parse circuit JSON: ${err.message}`),
        ] as const
      }

      // Filter out any existing pcb_traces
      circuitWithoutTraces = circuit.filter((item) => item.type !== "pcb_trace")

      // Convert circuit to DSN and save to temp file
      const [tempDsnPath, dsnError] = await convertAndSaveCircuitToDsn(
        circuitWithoutTraces,
      )
        .then((path) => [path, null] as const)
        .catch((err) => [null, err] as const)

      if (dsnError) {
        return [
          null,
          new Error(`Failed to convert circuit to DSN: ${dsnError.message}`),
        ] as const
      }
      dsnPath = tempDsnPath!
    } else {
      dsnPath = inputPath
    }

    // Run local freerouting
    debug(`Running freerouting on DSN file: ${dsnPath}`)
    const [routedDsn, routingError] = await routeUsingLocalFreerouting({
      inputPath: dsnPath,
    })
      .then((result) => [result, null] as const)
      .catch((err) => [null, err] as const)

    if (routingError) {
      return [
        null,
        new Error(`Freerouting failed: ${routingError.message}`),
      ] as const
    }

    // Read the original DSN file
    const [originalDsnContent, readError] = await readFile(dsnPath, "utf8")
      .then((data) => [data, null] as const)
      .catch((err) => [null, err] as const)

    if (readError) {
      return [
        null,
        new Error(`Failed to read original DSN file: ${readError.message}`),
      ] as const
    }

    let pcbJson: DsnPcb
    let sessionJson: DsnSession
    try {
      pcbJson = parseDsnToDsnJson(originalDsnContent!) as DsnPcb
      sessionJson = parseDsnToDsnJson(routedDsn!) as DsnSession
    } catch (err: any) {
      return [
        null,
        new Error(`Failed to parse DSN data: ${err.message}`),
      ] as const
    }

    // Convert back to circuit JSON
    const routedTraces = convertDsnSessionToCircuitJson(pcbJson, sessionJson)
    const outputCircuit = circuitWithoutTraces
      ? [...circuitWithoutTraces, ...routedTraces]
      : routedTraces

    // Create outputs directory
    const outputsDir = join(sampleDir, "outputs")
    const [, mkdirError] = await mkdir(outputsDir, { recursive: true })
      .then(() => [true, null] as const)
      .catch((err) => [null, err] as const)

    if (mkdirError) {
      return [
        null,
        new Error(`Failed to create outputs directory: ${mkdirError.message}`),
      ] as const
    }

    // Write output file
    const outputPath = join(outputsDir, "freerouting_routed_circuit.json")
    const [, writeError] = await writeFile(
      outputPath,
      JSON.stringify(outputCircuit, null, 2),
    )
      .then(() => [true, null] as const)
      .catch((err) => [null, err] as const)

    if (writeError) {
      return [
        null,
        new Error(`Failed to write output file: ${writeError.message}`),
      ] as const
    }

    debug(`Wrote routed circuit to: ${outputPath}`)

    // Clean up temporary DSN file
    if (!inputPath.toLowerCase().endsWith(".dsn")) {
      const [, unlinkError] = await unlink(dsnPath)
        .then(() => [true, null] as const)
        .catch((err) => [null, err] as const)

      if (unlinkError) {
        debug(
          `Warning: Failed to delete temporary DSN file: ${unlinkError.message}`,
        )
      } else {
        debug(`Deleted temporary DSN file: ${dsnPath}`)
      }
    }

    return [outputPath, null] as const
  })()

  if (error) {
    debug(`Error processing file ${inputPath}:`, error)
    throw error
  }

  return result
}
