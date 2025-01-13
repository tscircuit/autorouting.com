import { Command } from "commander"
import { runAutorouter } from "./run-autorouter"

export const autorouterRunCommand = (program: Command) => {
  program
    .command("run")
    .description("Run an autorouter on a circuit file or dataset")
    .argument("<input-path>", "Path to circuit JSON file or dataset directory")
    .option(
      "-a, --autorouter <name>",
      "Name of autorouter to use",
      "freerouting",
    )
    .option("-d, --dataset", "Treat input path as a dataset directory", false)
    .action(async (inputPath, options) => {
      try {
        if (!options.dataset && !inputPath.endsWith(".json")) {
          console.error(
            "Error: When not using --dataset flag, you must specify the path to an unrouted_circuit.json file",
          )
          console.error(
            "Example: autorouting run -a freerouting path/to/sample/unrouted_circuit.json",
          )
          process.exit(1)
        }

        await runAutorouter({
          inputPath,
          autorouter: options.autorouter,
          isDataset: options.dataset,
        })
        console.log("Successfully completed autorouting")
      } catch (error) {
        console.error("Failed to run autorouter:", error)
        process.exit(1)
      }
    })
}
