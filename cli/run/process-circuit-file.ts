import type { KyInstance } from "ky"
import { readFile, writeFile, mkdir } from "fs/promises"
import { join, dirname } from "path/posix"
import Debug from "debug"
import type { AnyCircuitElement } from "circuit-json"

const debug = Debug("autorouting:cli/run/process-circuit-file")

export async function processCircuitFile({
  inputPath,
  autorouter,
  serverUrl,
}: {
  inputPath: string
  autorouter: string
  serverUrl: string
}) {
  debug(`Processing circuit file: ${inputPath}`)

  const fetchWithDebug = (url: string, options: RequestInit) => {
    debug("fetching", url)
    return fetch(url, options)
  }
  const circuitJson = await readFile(inputPath, "utf8")
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
        display_name: inputPath,
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

      const sampleDir = dirname(inputPath)
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
