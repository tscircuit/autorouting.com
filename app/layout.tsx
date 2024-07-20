import React from "react"
import '../styles/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Next.js App</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
