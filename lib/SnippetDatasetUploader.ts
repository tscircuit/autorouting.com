import { createSample } from "./dataset/create-sample"
import EventEmitter3 from "eventemitter3"
import type { Dataset, Sample } from "@/api/lib/db/schema"
import { ky } from "lib/ky"

interface SnippetDatasetUploaderOptions {
  sessionToken: string
  snippetName: string
  sampleRange: { start: number; end: number }
}

interface SampleFinishedEvent {
  sampleNumber: number
}

interface SampleErrorEvent {
  sampleNumber: number
  error: Error
}

export declare interface ISnippetDatasetUploader {
  on(
    event: "sample:finished",
    listener: (event: SampleFinishedEvent) => void,
  ): this
  on(event: "sample:error", listener: (event: SampleErrorEvent) => void): this
}

export class SnippetDatasetUploader
  extends EventEmitter3
  implements ISnippetDatasetUploader
{
  private options: SnippetDatasetUploaderOptions

  dataset: Dataset | null = null

  constructor(options: SnippetDatasetUploaderOptions) {
    super()
    this.options = options
  }

  async run() {
    // Create the dataset first
    const { dataset } = await ky
      .post<{ dataset: Dataset }>("datasets/create", {
        json: {
          dataset_name: this.options.snippetName.split("/").pop(),
          median_trace_count: 100, // TODO: Calculate this
          max_layer_count: 2, // TODO: Calculate this
          license_type: "MIT",
          description_md: `Dataset generated from snippet [${this.options.snippetName}](https://tscircuit.com/${this.options.snippetName})`,
          version: "1.0.0",
          is_processing: true,
          replace_existing_if_processing: true,
        },
        headers: {
          Authorization: `Bearer ${this.options.sessionToken}`,
        },
      })
      .json()
      .catch(async (error) => {
        if (error.response) {
          const body = await error.response.json()
          throw new Error(`Failed to create dataset: ${JSON.stringify(body)}`)
        }
        throw error
      })

    this.dataset = dataset

    // Process each sample in the range
    for (
      let sampleNum = this.options.sampleRange.start;
      sampleNum <= this.options.sampleRange.end;
      sampleNum++
    ) {
      try {
        // Create the sample
        const { sample } = await ky
          .post<{ sample: Sample }>("samples/create", {
            json: {
              dataset_id: dataset.dataset_id,
              sample_number: sampleNum,
            },
            headers: {
              Authorization: `Bearer ${this.options.sessionToken}`,
            },
          })
          .json()

        // Generate all the sample files
        const { circuitJson, pcbSvg, simpleRouteJson, dsnString } =
          await createSample(
            "keyboard", // TODO: Make this configurable
            sampleNum,
            `@tsci/${this.options.snippetName.replace("/", ".")}`,
          )

        // Create each file
        const files = [
          {
            path: "unrouted_circuit.json",
            content: JSON.stringify(circuitJson, null, 2),
            mimetype: "application/json",
          },
          {
            path: "unrouted.dsn",
            content: dsnString,
            mimetype: "text/plain",
          },
          {
            path: "unrouted_pcb.svg",
            content: pcbSvg,
            mimetype: "image/svg+xml",
          },
          {
            path: "unrouted_simple_route.json",
            content: JSON.stringify(simpleRouteJson, null, 2),
            mimetype: "application/json",
          },
        ]

        // Upload each file
        for (const file of files) {
          await ky
            .post("samples/create_file", {
              json: {
                sample_id: sample.sample_id,
                file_path: file.path,
                mimetype: file.mimetype,
                text_content: file.content,
              },
              headers: {
                Authorization: `Bearer ${this.options.sessionToken}`,
              },
            })
            .json()
        }

        this.emit("sample:finished", { sampleNumber: sampleNum })
      } catch (error) {
        this.emit("sample:error", { sampleNumber: sampleNum, error })

        // TODO maybe we ignore these in the future to allow partial datasets
        throw error
      }
    }

    // Mark the dataset as not processing
    await ky.post("datasets/update", {
      json: {
        dataset_id: this.dataset.dataset_id,
        is_processing: false,
      },
      headers: {
        Authorization: `Bearer ${this.options.sessionToken}`,
      },
    })
  }
}
