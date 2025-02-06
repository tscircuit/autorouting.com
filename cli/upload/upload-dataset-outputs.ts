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
  const [result, error] = await (async () => {
    const cliConfig = new Configstore("tscircuit")
    const sessionToken =
      cliConfig.get("sessionToken") ?? process.env.TSCIRCUIT_AUTH_TOKEN
    if (!sessionToken) {
      return [
        null,
        new Error(
          "Authentication required. Please run 'tsci auth login' to authenticate.",
        ),
      ] as const
    }

    // Get dataset ID from the directory name
    const dirName = basename(datasetDirectory)
    // Convert "author.dataset-name" to "author/dataset-name"
    const [author, ...datasetNameParts] = dirName.split(".")
    if (!author || datasetNameParts.length === 0) {
      return [
        null,
        new Error(
          "Invalid dataset directory name format. Expected format: author.dataset-name",
        ),
      ] as const
    }
    const datasetNameWithOwner = `${author}/${datasetNameParts.join(".")}`

    debug(
      `Converting directory name "${dirName}" to dataset name "${datasetNameWithOwner}"`,
    )

    const [dataset, datasetError] = await ky
      .get("datasets/get", {
        searchParams: {
          dataset_name_with_owner: datasetNameWithOwner,
        },
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })
      .json<{ dataset: { dataset_id: string } }>()
      .then((data) => [data, null] as const)
      .catch((err) => [null, err] as const)

    if (datasetError) {
      return [
        null,
        new Error(`Failed to get dataset: ${datasetError.message}`),
      ] as const
    }

    // Find all sample directories
    const [sampleDirs, globError] = await glob("sample*/", {
      cwd: datasetDirectory,
      absolute: true,
    })
      .then((dirs) => [dirs, null] as const)
      .catch((err) => [null, err] as const)

    if (globError) {
      return [
        null,
        new Error(`Failed to list sample directories: ${globError.message}`),
      ] as const
    }

    for (const sampleDir of sampleDirs!) {
      const sampleNumber = parseInt(sampleDir.match(/sample(\d+)/)?.[1] || "0")
      if (!sampleNumber) continue

      // Check for output files
      const outputsDir = join(sampleDir, "outputs")
      const [outputFiles, outputGlobError] = await glob("*_routed*", {
        cwd: outputsDir,
        absolute: true,
      })
        .then((files) => [files, null] as const)
        .catch((err) => [null, err] as const)

      if (outputGlobError) {
        debug(
          `Warning: Failed to list output files in ${outputsDir}: ${outputGlobError.message}`,
        )
        continue
      }

      for (const outputFile of outputFiles!) {
        // Extract just the filename from outputs directory
        const relativeFilePath = outputFile
          .substring(outputsDir.length + 1)
          .replace(/\\/g, "/")

        const [newFileContent, readError] = await readFile(outputFile, "utf8")
          .then((content) => [content, null] as const)
          .catch((err) => [null, err] as const)

        if (readError) {
          debug(
            `Warning: Failed to read file ${outputFile}: ${readError.message}`,
          )
          continue
        }

        debug(`Processing file: ${relativeFilePath} for sample ${sampleNumber}`)

        // Check if file already exists and compare contents
        const [existingFileContent, existingFileError] = await ky
          .get("samples/view_file", {
            searchParams: {
              dataset_id: dataset!.dataset.dataset_id,
              sample_number: sampleNumber,
              file_path: relativeFilePath,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          })
          .text()
          .then((content) => [content, null] as const)
          .catch((err) => [null, err] as const)

        if (!existingFileError && existingFileContent === newFileContent) {
          debug(
            `File exists with same content: outputs/${relativeFilePath} for sample ${sampleNumber}, skipping`,
          )
          continue
        }

        debug(
          `File ${existingFileError ? "doesn't exist" : "exists but content differs"}: outputs/${relativeFilePath} for sample ${sampleNumber}`,
        )

        // Get the sample and its available files
        const [sampleResponse, sampleError] = await ky
          .get<{ sample: Sample & { available_file_paths: string[] } }>(
            "samples/get",
            {
              searchParams: {
                dataset_id: dataset!.dataset.dataset_id,
                sample_number: sampleNumber,
              },
              headers: {
                Authorization: `Bearer ${sessionToken}`,
              },
            },
          )
          .json()
          .then((data) => [data, null] as const)
          .catch((err) => [null, err] as const)

        if (sampleError) {
          debug(
            `Warning: Failed to get sample ${sampleNumber}: ${sampleError.message}`,
          )
          continue
        }

        // Check if file exists
        const [, fileExistsError] = await ky
          .get("samples/get_file", {
            searchParams: {
              sample_id: sampleResponse!.sample.sample_id,
              file_path: relativeFilePath,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          })
          .json()
          .then(() => [true, null] as const)
          .catch((err) => [null, err] as const)

        // Create or update the file based on existence
        const endpoint = fileExistsError
          ? "samples/create_file"
          : "samples/update_file"
        const [, uploadError] = await ky
          .post(endpoint, {
            json: {
              sample_id: sampleResponse!.sample.sample_id,
              file_path: relativeFilePath,
              mimetype: "application/json",
              text_content: newFileContent,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          })
          .then(() => [true, null] as const)
          .catch((err) => [null, err] as const)

        if (uploadError) {
          debug(
            `Warning: Failed to ${fileExistsError ? "create" : "update"} file ${relativeFilePath}: ${uploadError.message}`,
          )
          continue
        }

        debug(
          `Uploaded: outputs/${relativeFilePath} for sample ${sampleNumber}`,
        )
      }

      // Check for files that need to be deleted
      const [sampleForDeletion, sampleForDeletionError] = await ky
        .get<{ sample: Sample & { available_file_paths: string[] } }>(
          "samples/get",
          {
            searchParams: {
              dataset_id: dataset!.dataset.dataset_id,
              sample_number: sampleNumber,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          },
        )
        .json()
        .then((data) => [data, null] as const)
        .catch((err) => [null, err] as const)

      if (sampleForDeletionError) {
        debug(
          `Warning: Failed to get sample for deletion check: ${sampleForDeletionError.message}`,
        )
        continue
      }

      // Get list of files that should exist (from local directory)
      const [localFiles, localFilesError] = await glob("*_routed*", {
        cwd: outputsDir,
        absolute: false,
      })
        .then((files) => [files, null] as const)
        .catch((err) => [null, err] as const)

      if (localFilesError) {
        debug(`Warning: Failed to list local files: ${localFilesError.message}`)
        continue
      }

      // Find files that exist remotely but not locally
      const filesToDelete =
        sampleForDeletion!.sample.available_file_paths.filter(
          (remotePath) =>
            remotePath.includes("_routed") && !localFiles!.includes(remotePath),
        )

      // Delete each file that no longer exists locally
      for (const fileToDelete of filesToDelete) {
        debug(
          `Deleting remote file that no longer exists locally: ${fileToDelete}`,
        )
        const [, deleteError] = await ky
          .delete("samples/delete_file", {
            searchParams: {
              sample_id: sampleForDeletion!.sample.sample_id,
              file_path: fileToDelete,
            },
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          })
          .then(() => [true, null] as const)
          .catch((err) => [null, err] as const)

        if (deleteError) {
          debug(
            `Warning: Failed to delete file ${fileToDelete}: ${deleteError.message}`,
          )
          continue
        }
        debug(`Deleted remote file: ${fileToDelete}`)
      }
    }

    return [true, null] as const
  })()

  if (error) {
    debug(`Error uploading dataset outputs: ${error.message}`)
    throw error
  }
}
