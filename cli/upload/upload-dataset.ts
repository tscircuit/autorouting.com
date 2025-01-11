import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import Configstore from "configstore";
import { ky } from "../../lib/ky";
import { cliConfig } from "../main";

export async function uploadDatasetFromDirectory(datasetDir: string) {
  // Load user's session token (prefer configstore, fallback to cliConfig)
  const store = new Configstore("tscircuit");
  let sessionToken = store.get("sessionToken") as string;
  if (!sessionToken && cliConfig?.sessionToken) {
    sessionToken = cliConfig.sessionToken;
  }
  if (!sessionToken) {
    throw new Error("No session token found. Please log in first.");
  }

  // Read package.json to find dataset name
  const packageJsonPath = path.join(datasetDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const datasetNameFull = packageJson.name.replace("@autorouting/", "");

  console.log(`Uploading dataset: ${datasetNameFull}`);

  // Check for freerouting_routed.circuit.json & *.dsn
  const possibleFiles = [
    "freerouting_routed.circuit.json",
    "freerouting_routed.dsn",
  ];

  for (const fileName of possibleFiles) {
    const localPath = path.join(datasetDir, fileName);
    if (fs.existsSync(localPath)) {
      // Check if file already exists on server
      const fileExists = await checkFileAlreadyOnServer({ fileName, sessionToken });
      if (!fileExists) {
        // upload logic
        const content = fs.readFileSync(localPath, "utf-8");
        await ky.post("samples/create_file", {
          json: {
            file_path: fileName,
            mimetype: fileName.endsWith(".dsn") ? "text/plain" : "application/json",
            text_content: content
          },
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
      } else {
        console.log(`Skipping file ${fileName}; already on server.`);
      }
    }
  }
}

async function checkFileAlreadyOnServer({ fileName, sessionToken }: { fileName: string; sessionToken: string; }) {
  try {
    await ky.get("samples/get_file", {
      searchParams: { file_path: fileName },
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    return true; // file found
  } catch {
    return false; // not found
  }
}
