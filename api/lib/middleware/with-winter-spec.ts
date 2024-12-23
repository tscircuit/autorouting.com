import { createWithWinterSpec } from "winterspec"
// import { withDb } from "./with-db"
import {
  createWithDefaultExceptionHandling,
  withCors,
  withRequestLogging,
  withCtxError,
} from "winterspec/middleware"
import { withDb } from "./with-db"
import { withSessionAuth } from "./with-session-auth"

const withErrorHandling = createWithDefaultExceptionHandling({
  coloredLogs: true,
  includeStackTraceInResponse: true,
})

export const withRouteSpec = createWithWinterSpec({
  apiName: "autorouting Datasets API",
  productionServerUrl: "https://dataset-api.autorouting.com/api",
  beforeAuthMiddleware: [
    withRequestLogging,
    withErrorHandling,
    withCtxError,
    withCors,
  ],
  authMiddleware: {
    session: withSessionAuth,
  },
  afterAuthMiddleware: [
    withDb,
    createWithDefaultExceptionHandling({
      includeStackTraceInResponse: true,
    }),
  ],
})
