"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Code, Database, Route, Upload, UploadCloud } from "lucide-react"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">autorouting.com</span>
        </Link>
        <div className="flex-1" />
        <nav className="ml-8 flex space-x-6">
          <Link
            href="https://blog.autorouting.com"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              "text-muted-foreground",
            )}
          >
            Blog
          </Link>
          <Link
            href="/datasets"
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === "/datasets"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <Database className="w-4 h-4 mr-1 text-gray-500" />
            Datasets
          </Link>
          <Link
            href="/autorouters"
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === "/autorouters"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <Route className="w-4 h-4 mr-1 text-gray-500" />
            Autorouters
          </Link>
          <Link
            href="/contribute"
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === "/contribute"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <UploadCloud className="w-4 h-4 mr-1 text-gray-500" />
            Contribute
          </Link>
          <Link
            href="https://blog.autorouting.com/p/why-were-building-autoroutingcom"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/about" ? "text-primary" : "text-muted-foreground",
            )}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  )
}
