import { createWinterSpecBundleFromDir } from "winterspec/adapters/node"
import { Request as EdgeRuntimeRequest } from "@edge-runtime/primitives"
import { join } from "node:path"
import type { Middleware } from "winterspec"
import { createDatabase } from "@/api/lib/db/db-client"
import { getSeedDatabase } from "@/api/lib/db/seed"

export const startServer = async ({
  port,
  testDbName,
}: {
  port: number
  testDbName: string
}) => {
  const winterspecBundle = await createWinterSpecBundleFromDir(
    join(import.meta.dir, "../../api/routes"),
  )

  const db = createDatabase(getSeedDatabase())

  const middleware: Middleware[] = [
    async (req: any, ctx: any, next: any) => {
      ;(ctx as any).db = db

      return next(req, ctx)
    },
  ]

  const server = Bun.serve({
    fetch: (bunReq) => {
      const req = new EdgeRuntimeRequest(bunReq.url, {
        headers: bunReq.headers,
        method: bunReq.method,
        body: bunReq.body,
      })
      return winterspecBundle.makeRequest(req as any, {
        middleware,
      })
    },
    port,
  })

  return { server, db }
}
