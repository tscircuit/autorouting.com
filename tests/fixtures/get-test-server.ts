import { afterEach } from "bun:test"
import { tmpdir } from "node:os"
import defaultKy from "ky"
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

  const { server, db } = await startServer({
    port,
    testDbName,
  })

  const url = `http://127.0.0.1:${port}`
  const ky = defaultKy.create({
    prefixUrl: url,
  })

  const testUserKy = defaultKy.create({
    prefixUrl: url,
    headers: {
      Authorization: `Bearer ${await new jose.SignJWT({
        github_username: "testuser",
        account_id: "test-account-id",
        session_id: "test-session-id",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(new TextEncoder().encode("1234"))}`,
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
