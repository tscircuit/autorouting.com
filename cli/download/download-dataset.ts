import type { KyInstance } from "ky"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path/posix"
import { ky as defaultKy } from "@/lib/ky"
import { createPackageJson } from "./create-package-json"
interface DownloadDatasetOptions {
  datasetNameWithOwner: string
  outputDirectory: string
  ky?: KyInstance
}

export async function downloadDatasetToDirectory({
  datasetNameWithOwner,
  outputDirectory,
  ky = defaultKy,
}: DownloadDatasetOptions): Promise<string> {
  const [author, datasetName] = datasetNameWithOwner.split("/")
  const outputPath = join(outputDirectory, `${author}.${datasetName}`)

  // Get dataset info
  const [datasetResponse, datasetError] = await ky
    .get("datasets/get", {
      searchParams: {
        dataset_name_with_owner: datasetNameWithOwner,
      },
    })
    .json<{ dataset: { dataset_id: string; sample_count: number } }>()
    .then((data) => [data, null])
    .catch((err) => [null, err])
  if (datasetError) {
    throw new Error(
      `Failed to fetch dataset "${datasetNameWithOwner}". Please check if the dataset exists and you have access to it. Original error: ${datasetError.message}`,
    )
  }

  // Create the main dataset directory
  const [mkdirResult, mkdirError] = await mkdir(outputPath, { recursive: true })
    .then(() => [true, null])
    .catch((err) => [null, err])

  if (mkdirError) {
    throw new Error(
      `Failed to create dataset directory "${outputPath}". Original error: ${mkdirError.message}`,
    )
  }

  if (author && datasetName) {
    const [packageJsonResult, packageJsonError] = await createPackageJson(
      outputPath,
      { author, datasetName },
    )
      .then(() => [true, null])
      .catch((err) => [null, err])

    if (packageJsonError) {
      throw new Error(
        `Failed to create package.json in "${outputPath}". Original error: ${packageJsonError.message}`,
      )
    }
  }

  // Download each sample
  for (
    let sampleNumber = 1;
    sampleNumber <= datasetResponse.dataset.sample_count;
    sampleNumber++
  ) {
    // Get sample info with available files
    const [sampleResponse, sampleError] = await ky
      .get("samples/get", {
        searchParams: {
          dataset_id: datasetResponse.dataset.dataset_id,
          sample_number: sampleNumber,
        },
      })
      .json<{
        sample: {
          sample_id: string
          available_file_paths: string[]
        }
      }>()
      .then((data) => [data, null])
      .catch((err) => [null, err])

    if (sampleError) {
      throw new Error(
        `Failed to fetch sample ${sampleNumber} for dataset "${datasetNameWithOwner}". Original error: ${sampleError.message}`,
      )
    }

    const sample = sampleResponse.sample
    const sampleDir = join(outputPath, `sample${sampleNumber}`)

    const [sampleDirResult, sampleDirError] = await mkdir(sampleDir, {
      recursive: true,
    })
      .then(() => [true, null])
      .catch((err) => [null, err])

    if (sampleDirError) {
      throw new Error(
        `Failed to create directory for sample ${sampleNumber} at "${sampleDir}". Original error: ${sampleDirError.message}`,
      )
    }

    // Download each file for the sample
    for (const filePath of sample.available_file_paths) {
      const [fileContent, fileError] = await ky
        .get("samples/view_file", {
          searchParams: {
            sample_id: sample.sample_id,
            file_path: filePath,
          },
        })
        .text()
        .then((data) => [data, null])
        .catch((err) => [null, err])

      if (fileError) {
        throw new Error(
          `Failed to fetch file "${filePath}" for sample ${sampleNumber}. Original error: ${fileError.message}`,
        )
      }

      if (filePath.includes("_routed")) {
        const [outputsDirResult, outputsDirError] = await mkdir(
          join(sampleDir, "outputs"),
          { recursive: true },
        )
          .then(() => [true, null])
          .catch((err) => [null, err])

        if (outputsDirError) {
          throw new Error(
            `Failed to create outputs directory for sample ${sampleNumber} at "${sampleDir}/outputs". Original error: ${outputsDirError.message}`,
          )
        }

        const [writeOutputResult, writeError] = await writeFile(
          join(sampleDir, "outputs", filePath),
          fileContent,
        )
          .then(() => [true, null])
          .catch((err) => [null, err])

        if (writeError) {
          throw new Error(
            `Failed to write file "${filePath}" for sample ${sampleNumber}. Original error: ${writeError.message}`,
          )
        }

        continue
      }

      const [writeResult, writeError] = await writeFile(
        join(sampleDir, filePath),
        fileContent,
      )
        .then(() => [true, null])
        .catch((err) => [null, err])

      if (writeError) {
        throw new Error(
          `Failed to write file "${filePath}" for sample ${sampleNumber}. Original error: ${writeError.message}`,
        )
      }
    }
  }

  return outputPath
}
