import { Command } from "commander"
import { uploadDatasetOutputs } from "./upload-dataset-outputs"

export const registerUploadDatasetCommand = (program: Command) => {
  program
    .command("upload")
    .description("Upload commands")
    .option("-d,--dataset", "flag to upload dataset routes")
    .argument("<dataset-directory>", "Path to dataset directory")
    .description("Upload dataset routes solutions to the database")
    .action(async (datasetDirectory) => {
      await uploadDatasetOutputs({ datasetDirectory })
      console.log("Successfully uploaded dataset outputs")
    })
}
