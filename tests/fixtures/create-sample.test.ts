import { test, expect } from "bun:test"
import { createSample } from "./create-sample"

test("create keyboard sample", async () => {
  const { circuitJson, dsnString, pcbSvg, schematicSvg, simpleRouteJson } =
    await createSample("keyboard", 1)

  expect(circuitJson).toBeDefined()
  expect(dsnString).toBeDefined()
  expect(pcbSvg).toBeDefined()
  expect(schematicSvg).toBeDefined()
  expect(simpleRouteJson).toBeDefined()
})