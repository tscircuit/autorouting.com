"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <span className="text-2xl font-bold">ar</span>
          </div>
          <span className="text-xl font-bold">autorouting</span>
        </Link>
        <nav className="ml-8 flex space-x-6">
          <Link
            href="/datasets"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/datasets"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            Datasets
          </Link>
          <Link
            href="/models"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/models" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Models
          </Link>
        </nav>
      </div>
    </header>
  )
}
