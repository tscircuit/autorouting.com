import { Command } from "commander"
import { downloadDatasetToDirectory } from "../download-dataset"
import { cwd } from "process"

export const datasetDownloadCommand = new Command()
  .command("download")
  .description("Download a dataset to the local filesystem")
  .argument(
    "<dataset-name>",
    "Dataset name (e.g. seveibar/growing-grid-keyboard-sample)",
  )
  .option("-o, --output <directory>", "Output directory", cwd())
  .action(async (datasetName, options) => {
    try {
      const outputPath = await downloadDatasetToDirectory({
        datasetNameWithOwner: datasetName,
        outputDirectory: options.output,
      })
      console.log(`Successfully downloaded dataset to: ${outputPath}`)
    } catch (error) {
      console.error("Failed to download dataset:", error)
      process.exit(1)
    }
  })
