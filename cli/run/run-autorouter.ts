import type { KyInstance } from "ky"
import { readFile, writeFile, mkdir } from "fs/promises"
import { join, dirname } from "path/posix"
import { glob } from "glob"
import Debug from "debug"
import { stat } from "fs/promises"
import type { AnyCircuitElement } from "circuit-json"

const debug = Debug("autorouting:cli")

interface RunAutorouterOptions {
  inputPath: string
  autorouter: string
  isDataset?: boolean
  ky?: KyInstance
  serverUrl?: string
}

async function processCircuitFile(
  circuitPath: string,
  autorouter: string,
  serverUrl: string,
) {
  debug(`Processing circuit file: ${circuitPath}`)
  const fetchWithDebug = (url: string, options: RequestInit) => {
    debug("fetching", url)
    return fetch(url, options)
  }
  const circuitJson = await readFile(circuitPath, "utf8")
  const circuit: AnyCircuitElement[] = JSON.parse(circuitJson)

  // Create autorouting job
  const { autorouting_job } = await fetchWithDebug(
    `${serverUrl}/autorouting/jobs/create`,
    {
      method: "POST",
      body: JSON.stringify({
        input_circuit_json: circuit,
        provider: autorouter,
        autostart: true,
        display_name: circuitPath,
      }),
      headers: { "Content-Type": "application/json" },
    },
  ).then((r) => r.json())

  // Poll until job is complete
  while (true) {
    const { autorouting_job: job } = await fetchWithDebug(
      `${serverUrl}/autorouting/jobs/get`,
      {
        method: "POST",
        body: JSON.stringify({
          autorouting_job_id: autorouting_job.autorouting_job_id,
        }),
        headers: { "Content-Type": "application/json" },
      },
    ).then((r) => r.json())

    if (job.is_finished) {
      const { autorouting_job_output } = await fetchWithDebug(
        `${serverUrl}/autorouting/jobs/get_output`,
        {
          method: "POST",
          body: JSON.stringify({
            autorouting_job_id: autorouting_job.autorouting_job_id,
          }),
          headers: { "Content-Type": "application/json" },
        },
      ).then((r) => r.json())

      const sampleDir = dirname(circuitPath)
      const outputsDir = join(sampleDir, "outputs")
      await mkdir(outputsDir, { recursive: true })

      // Filter out any existing pcb_traces from the original circuit
      const circuitWithoutTraces = circuit.filter(
        (item) => item.type !== "pcb_trace",
      )

      // Add the new traces from the autorouter
      const outputCircuit = [
        ...circuitWithoutTraces,
        ...autorouting_job_output.output_pcb_traces,
      ]

      const outputPath = join(outputsDir, `${autorouter}_routed_circuit.json`)
      await writeFile(outputPath, JSON.stringify(outputCircuit, null, 2))
      debug(`Wrote output to: ${outputPath}`)
      return outputPath
    }

    if (job.has_error) {
      throw new Error(`Autorouting job failed: ${JSON.stringify(job.error)}`)
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

export async function runAutorouter({
  inputPath,
  autorouter,
  isDataset = false,
  serverUrl = "https://registry-api.tscircuit.com",
}: RunAutorouterOptions) {
  if (isDataset) {
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
          await processCircuitFile(unroutedCircuitPath, autorouter, serverUrl)
        }
      } catch (error) {
        debug(`Skipping ${sampleFolder} - no unrouted_circuit.json found`)
        continue
      }
    }
  } else {
    debug(`Processing single file: ${inputPath}`)
    await processCircuitFile(inputPath, autorouter, serverUrl)
  }
}
