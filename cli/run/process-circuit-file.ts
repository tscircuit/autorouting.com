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
  const [result, error] = await (async () => {
    debug(`Processing circuit file: ${inputPath}`)

    const fetchWithDebug = (url: string, options: RequestInit) => {
      debug("fetching", url)
      return fetch(url, options)
    }

    // Read and parse input file
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

    // Create autorouting job
    const [jobResponse, jobError] = await fetchWithDebug(
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
    )
      .then((r) => r.json())
      .then((data) => [data, null] as const)
      .catch((err) => [null, err] as const)

    if (jobError) {
      return [
        null,
        new Error(`Failed to create autorouting job: ${jobError.message}`),
      ] as const
    }

    const { autorouting_job } = jobResponse!

    // Poll until job is complete
    while (true) {
      const [jobStatus, statusError] = await fetchWithDebug(
        `${serverUrl}/autorouting/jobs/get`,
        {
          method: "POST",
          body: JSON.stringify({
            autorouting_job_id: autorouting_job.autorouting_job_id,
          }),
          headers: { "Content-Type": "application/json" },
        },
      )
        .then((r) => r.json())
        .then((data) => [data, null] as const)
        .catch((err) => [null, err] as const)

      if (statusError) {
        return [
          null,
          new Error(`Failed to get job status: ${statusError.message}`),
        ] as const
      }

      const { autorouting_job: job } = jobStatus!

      if (job.has_error) {
        return [
          null,
          new Error(`Autorouting job failed: ${JSON.stringify(job.error)}`),
        ] as const
      }

      if (job.is_finished) {
        const [outputResponse, outputError] = await fetchWithDebug(
          `${serverUrl}/autorouting/jobs/get_output`,
          {
            method: "POST",
            body: JSON.stringify({
              autorouting_job_id: autorouting_job.autorouting_job_id,
            }),
            headers: { "Content-Type": "application/json" },
          },
        )
          .then((r) => r.json())
          .then((data) => [data, null] as const)
          .catch((err) => [null, err] as const)

        if (outputError) {
          return [
            null,
            new Error(`Failed to get job output: ${outputError.message}`),
          ] as const
        }

        const { autorouting_job_output } = outputResponse!

        const sampleDir = dirname(inputPath)
        const outputsDir = join(sampleDir, "outputs")

        const [, mkdirError] = await mkdir(outputsDir, { recursive: true })
          .then(() => [true, null] as const)
          .catch((err) => [null, err] as const)

        if (mkdirError) {
          return [
            null,
            new Error(
              `Failed to create outputs directory: ${mkdirError.message}`,
            ),
          ] as const
        }

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

        debug(`Wrote output to: ${outputPath}`)
        return [outputPath, null] as const
      }

      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  })()

  if (error) {
    debug(`Error processing circuit file: ${error.message}`)
    throw error
  }

  return result!
}
