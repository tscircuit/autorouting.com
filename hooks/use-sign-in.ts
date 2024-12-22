import { useGlobalStore } from "./use-global-store"
// import { useIsUsingFakeApi } from "./use-is-using-fake-api"
import { useSnippetsBaseApiUrl } from "./use-snippets-base-api-url"

/**
 * Send the user to the GitHub OAuth login page, they will be redirected back to
 * /authorize with session_token in the URL.
 */
export const useSignIn = () => {
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const isUsingFakeApi = false // useIsUsingFakeApi()
  const setSession = useGlobalStore((s) => s.setSession)
  return () => {
    if (!isUsingFakeApi) {
      const nextUrl = window.location.origin.replace("127.0.0.1", "localhost")
      window.location.href = `${snippetsBaseApiUrl}/internal/oauth/github/authorize?next=${nextUrl}/authorize`
    } else {
      setSession({
        account_id: "account-1234",
        github_username: "testuser",
        token: "1234",
        session_id: "session-1234",
      })
    }
  }
}
