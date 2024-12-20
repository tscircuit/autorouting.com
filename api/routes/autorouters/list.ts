import { withRouteSpec } from "@/api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { autorouterSchema } from "@/api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  jsonResponse: z.object({
    autorouters: z.array(autorouterSchema),
  }),
})((req, ctx) => {
  const autorouters = ctx.db.getState().autorouters

  return ctx.json({ autorouters })
})
