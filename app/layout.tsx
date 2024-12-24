import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Header } from "@/components/header"
import Providers from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Autorouting - PCB Datasets and Models",
  description: "Browse and download PCB autorouting datasets and models",
}
export const fetchCache = 'force-no-store'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
