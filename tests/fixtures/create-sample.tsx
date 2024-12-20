import {
  convertCircuitJsonToSchematicSvg,
  convertCircuitJsonToPcbSvg,
} from "circuit-to-svg"
import { createCircuitWebWorker } from "@tscircuit/eval-webworker"
import webWorkerUrl from "@tscircuit/eval-webworker/blob-url"
import { getSimpleRouteJson } from "@tscircuit/infgrid-ijump-astar"
import { convertCircuitJsonToDsnString } from "dsn-converter"

export const createSampleCircuitJson = async (
  circuitType: "keyboard" | "blinking-led",
  sampleNum: number,
) => {
  const circuit = await createCircuitWebWorker({
    webWorkerUrl,
  })

  if (circuitType === "keyboard") {
    await circuit.execute(`
      import KeyboardSample from "@tsci/seveibar.keyboard-sample"

      circuit.add(<KeyboardSample sampleNumber={${sampleNum}} />)
    `)

    const circuitJson = await circuit.getCircuitJson()

    return circuitJson
  }

  throw new Error(`Invalid circuit type: "${circuitType}"`)
}

export const createSample = async (
  circuitType: "keyboard" | "blinking-led",
  sampleNum: number,
) => {
  const circuitJson = await createSampleCircuitJson(circuitType, sampleNum)

  const schematicSvg = convertCircuitJsonToSchematicSvg(circuitJson)
  const pcbSvg = convertCircuitJsonToPcbSvg(circuitJson)

  const simpleRouteJson = await getSimpleRouteJson(circuitJson)
  const dsnString = convertCircuitJsonToDsnString(circuitJson)

  return { circuitJson, schematicSvg, pcbSvg, simpleRouteJson, dsnString }
}
