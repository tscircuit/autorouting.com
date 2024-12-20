import { createStore, type StoreApi } from "zustand/vanilla"
import { immer } from "zustand/middleware/immer"
import { hoist, type HoistedStoreApi } from "zustand-hoist"

import { databaseSchema, type DatabaseSchema } from "./schema"
import { combine } from "zustand/middleware"
import type { z } from "zod"

export const createDatabase = (
  initialState: z.input<typeof databaseSchema>
) => {
  return hoist(createStore(getInitializer(initialState)))
}

export type DbClient = ReturnType<typeof createDatabase>

const getInitializer = (initialState: z.input<typeof databaseSchema>) =>
  combine(databaseSchema.parse(initialState), (set) => ({}))
