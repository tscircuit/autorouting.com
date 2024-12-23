"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSignIn } from "@/hooks/use-sign-in"

export function ContributeLoginStep(props: {}) {
  const signIn = useSignIn()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Login</CardTitle>
        <CardDescription>Please login to contribute a dataset</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={() => signIn()}>
          Login with GitHub
        </Button>
      </CardContent>
    </Card>
  )
}
