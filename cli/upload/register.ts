import { Command } from "commander";
import { uploadDatasetFromDirectory } from "./upload-dataset";

export const datasetUploadCommand = (program: Command) => {
  program
    .command("upload")
    .description("Upload a dataset from the local filesystem")
    .argument("<datasetDir>", "Local dataset directory path")
    .action(async (datasetDir: string) => {
      try {
        await uploadDatasetFromDirectory(datasetDir);
        console.log(`Successfully uploaded dataset from: ${datasetDir}`);
      } catch (error) {
        console.error("Failed to upload dataset:", error);
        process.exit(1);
      }
    });
};
