import { notFound } from "next/navigation"

interface AutorouterPageProps {
  params: Promise<{
    autorouter: string
  }>
}

export default async function AutorouterPage({
  params: $params,
}: AutorouterPageProps) {
  const params = await $params

  if (!params.autorouter) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4">{params.autorouter}</h1>
      {/* Autorouter specific content will go here */}
    </div>
  )
}
