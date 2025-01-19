import { afterEach } from "bun:test"
import { tmpdir } from "node:os"
import defaultKy, { type AfterResponseHook } from "ky"
import { startServer } from "./start-server"
import { seedDatabase } from "./seed-database"
import * as jose from "jose"

interface TestFixture {
  url: string
  server: any
  ky: typeof defaultKy
  testUserKy: typeof defaultKy
}

export const getTestServer = async (): Promise<TestFixture> => {
  const port = 3001 + Math.floor(Math.random() * 999)
  const testInstanceId = Math.random().toString(36).substring(2, 15)
  const testDbName = `testdb${testInstanceId}`

  const testUserAuthToken = await new jose.SignJWT({
    github_username: "testuser",
    account_id: "test-account-id",
    session_id: "test-session-id",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode("1234"))

  process.env.TSCIRCUIT_AUTH_TOKEN = testUserAuthToken

  const { server, db } = await startServer({
    port,
    testDbName,
  })

  const url = `http://127.0.0.1:${port}`

  const prettyResponseErrorHook: AfterResponseHook = async (
    _request,
    _options,
    response,
  ) => {
    if (!response.ok) {
      try {
        const errorData = await response.json()
        throw new Error(
          `FAIL [${response.status}]: ${_request.method} ${
            new URL(_request.url).pathname
          } \n\n ${JSON.stringify(errorData, null, 2)}`,
        )
      } catch (e) {
        //ignore, allow the error to be thrown
      }
    }
  }

  const ky = defaultKy.create({
    prefixUrl: url,
    hooks: {
      afterResponse: [prettyResponseErrorHook],
    },
  })

  const testUserKy = defaultKy.create({
    prefixUrl: url,
    headers: {
      Authorization: `Bearer ${testUserAuthToken}`,
    },
    hooks: {
      afterResponse: [prettyResponseErrorHook],
    },
  })

  afterEach(async () => {
    await server.stop()
    // Here you might want to add logic to drop the test database
  })

  return {
    url,
    server,
    ky,
    testUserKy,
  }
}
