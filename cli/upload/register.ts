import { Command } from "commander"
import { uploadDatasetOutputs } from "./upload-dataset-outputs"

export const registerUploadDatasetCommand = (program: Command) => {
  program
    .command("upload")
    .description("Upload commands")
    .command("dataset <dataset-dir>")
    .description("Upload dataset routes solutions to the database")
    .action(async (datasetDirectory) => {
      try {
        await uploadDatasetOutputs({ datasetDirectory })
        console.log("Successfully uploaded dataset outputs")
      } catch (error) {
        console.error("Failed to upload dataset outputs:", error)
        process.exit(1)
      }
    })
}
