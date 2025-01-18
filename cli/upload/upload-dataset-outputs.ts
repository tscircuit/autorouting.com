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
    const outputFiles = await glob("*_routed*", {
      cwd: outputsDir,
      absolute: true,
    })

    for (const outputFile of outputFiles) {
      // Extract just the filename from outputs directory
      const relativeFilePath = outputFile
        .substring(outputsDir.length + 1)
        .replace(/\\/g, "/")
      const newFileContent = await readFile(outputFile, "utf8")

      debug(`Processing file: ${relativeFilePath} for sample ${sampleNumber}`)

      // Check if file already exists and compare contents
      try {
        const existingFileContent = await ky
          .get("samples/view_file", {
            searchParams: {
              dataset_id: dataset.dataset.dataset_id,
              sample_number: sampleNumber,
              file_path: relativeFilePath,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          })
          .text()

        // Compare the contents
        if (existingFileContent === newFileContent) {
          debug(
            `File exists with same content: outputs/${relativeFilePath} for sample ${sampleNumber}, skipping`,
          )
          continue
        }

        debug(
          `File exists but content differs: outputs/${relativeFilePath} for sample ${sampleNumber}, updating`,
        )
      } catch (error) {
        debug(
          `File doesn't exist: outputs/${relativeFilePath} for sample ${sampleNumber}`,
        )
      }

      // Get the sample and its available files
      const { sample } = await ky
        .get<{ sample: Sample & { available_file_paths: string[] } }>(
          "samples/get",
          {
            searchParams: {
              dataset_id: dataset.dataset.dataset_id,
              sample_number: sampleNumber,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          },
        )
        .json()

      // Check if file exists
      let fileExists = false
      try {
        const existingFile = await ky
          .get("samples/get_file", {
            searchParams: {
              sample_id: sample.sample_id,
              file_path: relativeFilePath,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          })
          .json()
        fileExists = true
      } catch (error) {
        debug(`File doesn't exist, will create new: ${relativeFilePath}`)
      }

      // Create or update the file based on existence
      const endpoint = fileExists
        ? "samples/update_file"
        : "samples/create_file"
      await ky.post(endpoint, {
        json: {
          sample_id: sample.sample_id,
          file_path: relativeFilePath,
          mimetype: "application/json",
          text_content: newFileContent,
        },
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })

      debug(`Uploaded: outputs/${relativeFilePath} for sample ${sampleNumber}`)
    }

    // Check for files that need to be deleted
    const { sample } = await ky
      .get<{ sample: Sample & { available_file_paths: string[] } }>(
        "samples/get",
        {
          searchParams: {
            dataset_id: dataset.dataset.dataset_id,
            sample_number: sampleNumber,
          },
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        },
      )
      .json()

    // Get list of files that should exist (from local directory)
    const localFiles = await glob("*_routed*", {
      cwd: outputsDir,
      absolute: false,
    })

    // Find files that exist remotely but not locally
    const filesToDelete = sample.available_file_paths.filter(
      (remotePath) =>
        remotePath.includes("_routed") && !localFiles.includes(remotePath),
    )

    // Delete each file that no longer exists locally
    for (const fileToDelete of filesToDelete) {
      debug(
        `Deleting remote file that no longer exists locally: ${fileToDelete}`,
      )
      await ky.delete("samples/delete_file", {
        searchParams: {
          sample_id: sample.sample_id,
          file_path: fileToDelete,
        },
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })
      debug(`Deleted remote file: ${fileToDelete}`)
    }
  }
}
