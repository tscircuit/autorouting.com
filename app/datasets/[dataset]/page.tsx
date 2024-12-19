import { notFound } from "next/navigation"

interface DatasetPageProps {
  params: {
    dataset: string
  }
}

export default function DatasetPage({ params }: DatasetPageProps) {
  // TODO: Fetch dataset info and validate it exists
  if (!params.dataset) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4">{params.dataset}</h1>
      {/* Dataset specific content will go here */}
    </div>
  )
}
