import type { DbClient } from "@/api/lib/db/db-client"
import { createDatabase } from "@/api/lib/db/db-client"
import type { Middleware } from "winterspec"

export const withDb: Middleware<
  {},
  {
    db: DbClient
  }
> = async (req, ctx, next) => {
  if (!ctx.db) {
    ctx.db = createDatabase()
  }
  return next(req, ctx)
}
