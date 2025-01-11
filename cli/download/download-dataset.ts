import type { KyInstance } from "ky"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path/posix"
import { ky as defaultKy } from "@/lib/ky"
interface DownloadDatasetOptions {
  datasetNameWithOwner: string
  outputDirectory: string
  ky?: KyInstance
}

export async function downloadDatasetToDirectory({
  datasetNameWithOwner,
  outputDirectory,
  ky = defaultKy,
}: DownloadDatasetOptions) {
  const [author, datasetName] = datasetNameWithOwner.split("/")
  const outputPath = join(outputDirectory, `${author}.${datasetName}`)

  // Get dataset info
  const dataset = await ky
    .get("datasets/get", {
      searchParams: {
        dataset_name_with_owner: datasetNameWithOwner,
      },
    })
    .json<{ dataset: { dataset_id: string; sample_count: number } }>()

  // Create the main dataset directory
  await mkdir(outputPath, { recursive: true })

  // Download each sample
  for (
    let sampleNumber = 1;
    sampleNumber <= dataset.dataset.sample_count;
    sampleNumber++
  ) {
    // Get sample info with available files
    const sampleResponse = await ky
      .get("samples/get", {
        searchParams: {
          dataset_id: dataset.dataset.dataset_id,
          sample_number: sampleNumber,
        },
      })
      .json<{
        sample: {
          sample_id: string
          available_file_paths: string[]
        }
      }>()

    const sample = sampleResponse.sample
    const sampleDir = join(outputPath, `sample${sampleNumber}`)
    await mkdir(sampleDir, { recursive: true })

    // Download each file for the sample
    for (const filePath of sample.available_file_paths) {
      const fileContent = await ky
        .get("samples/view_file", {
          searchParams: {
            sample_id: sample.sample_id,
            file_path: filePath,
          },
        })
        .text()

      await writeFile(join(sampleDir, filePath), fileContent)
    }
  }

  // Create package.json for the dataset
  const packageJsonContent = {
    name: `@autorouting/${author}.${datasetName}`,
    version: "1.0.0",
    description: "Auto-generated package.json for autorouting dataset",
    license: "MIT"
  };

  await writeFile(
    join(outputPath, "package.json"),
    JSON.stringify(packageJsonContent, null, 2)
  );

  return outputPath
}
