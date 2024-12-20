import type { Middleware } from "winterspec"

export const withDb: Middleware<{}, {}> = async (req, ctx, next) => {
  return next(req, ctx)
}
