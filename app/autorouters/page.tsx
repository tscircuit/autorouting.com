import { Input } from "@/components/ui/input"
import { AutorouterMiniCard } from "@/components/AutorouterMiniCard"
import { ky } from "@/lib/ky"
import type { Autorouter, autorouterSchema } from "@/api/lib/db/schema.js"
import type { z } from "zod"

export const dynamic = "force-dynamic"

export default async function AutoroutersPage() {
  const { autorouters } = await ky
    .get<{
      autorouters: Autorouter[]
    }>("autorouters/list")
    .json()

  return (
    <div className="container mx-auto">
      <div className="flex">
        <div className="flex flex-col flex-grow">
          <div className="p-4 flex items-center justify-center">
            <h1 className="text-md">
              Autorouters <span className="text-gray-500">2</span>
            </h1>
            <div className="flex-grow" />
            <Input className="max-w-64" placeholder="Search autorouters" />
          </div>
          <div className="px-2">
            {autorouters.map((autorouter) => (
              <AutorouterMiniCard
                key={autorouter.autorouter_id}
                autorouter={autorouter}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
