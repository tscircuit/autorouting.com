import { Command } from "commander"
import { downloadDatasetToDirectory } from "./download-dataset"
import { cwd } from "process"

export const datasetDownloadCommand = (program: Command) => {
  program
    .command("download")
    .description("Download a dataset to the local filesystem")
    .argument(
      "<dataset-name>",
      "Dataset name (e.g. seveibar/growing-grid-keyboard-sample)",
    )
    .option("-o, --output <directory>", "Output directory", cwd())
    .action(async (datasetName, options) => {
      const [outputPath, error] = await downloadDatasetToDirectory({
        datasetNameWithOwner: datasetName,
        outputDirectory: options.output,
      })

      if (error) {
        throw error
      }

      console.log(`Successfully downloaded dataset to: ${outputPath}`)
    })
}
