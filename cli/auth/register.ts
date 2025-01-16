import { Command } from "commander"

export function authCommand(program: Command) {
  // Create the "auth" command with a "login" subcommand
  const auth = program
    .command("auth")
    .description("Authentication-related actions")

  auth
    .command("login")
    .description("Log in with GitHub (stub implementation)")
    .action(() => {
      console.log("Stub: 'tsci auth login' command invoked!")
      // Here, you would place any logic needed to handle GitHub OAuth or token flow
    })

  // Create an alias command "login" at the top level
  program
    .command("login")
    .description("Alias for 'tsci auth login'")
    .action(() => {
      console.log("Stub: 'tsci login' command invoked!")
      // Simply call the same logic
    })
}
