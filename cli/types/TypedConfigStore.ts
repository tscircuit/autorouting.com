import type Configstore from "configstore"

export type TypedConfigstore<T> = Omit<Configstore, "get" | "set"> & {
  get<K extends keyof T>(key: K): T[K] | undefined
  set<K extends keyof T>(key: K, value: T[K]): void
}
