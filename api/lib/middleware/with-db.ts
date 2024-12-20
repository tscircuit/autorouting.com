import type { DbClient } from "@/api/lib/db/db-client"
import { createDatabase } from "@/api/lib/db/db-client"
import { seedDatabase } from "@/tests/fixtures/seed-database"
import type { Middleware } from "winterspec"

export const withDb: Middleware<
  {},
  {
    db: DbClient
  }
> = async (req, ctx, next) => {
  if (!ctx.db) {
    ctx.db = createDatabase()
    // await seedDatabase(ctx.db)
  }
  return next(req, ctx)
}
