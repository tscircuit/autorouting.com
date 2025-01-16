import { glob } from "glob"
import { readFile } from "fs/promises"
import { join, basename } from "path/posix"
import type { KyInstance } from "ky"
import { ky as defaultKy } from "@/lib/ky"
import Configstore from "configstore"
import Debug from "debug"
import type { Sample } from "@/api/lib/db/schema"

const debug = Debug("autorouting:cli/upload/upload-dataset-outputs")

interface UploadDatasetOutputsOptions {
  datasetDirectory: string
  ky?: KyInstance
}

export async function uploadDatasetOutputs({
  datasetDirectory,
  ky = defaultKy,
}: UploadDatasetOutputsOptions) {
  const cliConfig = new Configstore("tscircuit")
  const sessionToken = cliConfig.get("sessionToken")

  if (!sessionToken) {
    throw new Error(
      "Authentication required. Please run 'tsci auth login' to authenticate.",
    )
  }

  // Get dataset ID from the directory name
  const dirName = basename(datasetDirectory)
  // Convert "author.dataset-name" to "author/dataset-name"
  const [author, ...datasetNameParts] = dirName.split(".")
  if (!author || datasetNameParts.length === 0) {
    throw new Error(
      "Invalid dataset directory name format. Expected format: author.dataset-name",
    )
  }
  const datasetNameWithOwner = `${author}/${datasetNameParts.join(".")}`

  debug(
    `Converting directory name "${dirName}" to dataset name "${datasetNameWithOwner}"`,
  )

  const dataset = await ky
    .get("datasets/get", {
      searchParams: {
        dataset_name_with_owner: datasetNameWithOwner,
      },
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
    .json<{ dataset: { dataset_id: string } }>()
  console.log("dataset", dataset)

  // Find all sample directories
  const sampleDirs = await glob("sample*/", {
    cwd: datasetDirectory,
    absolute: true,
  })

  for (const sampleDir of sampleDirs) {
    const sampleNumber = parseInt(sampleDir.match(/sample(\d+)/)?.[1] || "0")
    if (!sampleNumber) continue

    // Check for output files
    const outputsDir = join(sampleDir, "outputs")
    const outputFiles = await glob("*_routed_circuit.json", {
      cwd: outputsDir,
      absolute: true,
    })

    for (const outputFile of outputFiles) {
      const fileName =
        outputFile.split("outputs/").pop() || basename(outputFile)

      console.log("fileName", fileName)
      // Check if file already exists
      try {
        await ky
          .get("samples/view_file", {
            searchParams: {
              dataset_id: dataset.dataset.dataset_id,
              sample_number: sampleNumber,
              file_path: `freerouting_routed_circuit.json`,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          })
          .text()

        debug(
          `File already exists: outputs/${fileName} for sample ${sampleNumber}`,
        )
        continue
      } catch (error) {
        // File doesn't exist, proceed with upload
      }

      const fileContent = await readFile(outputFile, "utf8")

      // First get the sample ID using dataset_id and sample_number
      const { sample } = await ky
        .get<{ sample: Sample }>("samples/get", {
          searchParams: {
            dataset_id: dataset.dataset.dataset_id,
            sample_number: sampleNumber,
          },
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        .json()

      // Then create the file for that sample
      await ky.post("samples/create_file", {
        json: {
          sample_id: sample.sample_id,
          file_path: `freerouting_routed_circuit.json`,
          mimetype: "application/json",
          text_content: fileContent,
        },
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })

      debug(`Uploaded: outputs/${fileName} for sample ${sampleNumber}`)
    }
  }
}
