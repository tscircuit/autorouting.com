import type { DbClient } from "@/api/lib/db/db-client"
import { createDatabase } from "@/api/lib/db/db-client"
import { seedDatabase } from "@/tests/fixtures/seed-database"
import type { Middleware } from "winterspec"
import { getSeedDatabase } from "../db/seed"

declare global {
  var db: DbClient | undefined
}

export const withDb: Middleware<
  {},
  {
    db: DbClient
  }
> = async (req, ctx, next) => {
  if (!ctx.db) {
    if (globalThis.db) {
      ctx.db = globalThis.db
      return next(req, ctx)
    }
    ctx.db = createDatabase(getSeedDatabase())
    globalThis.db = ctx.db
  }
  return next(req, ctx)
}
