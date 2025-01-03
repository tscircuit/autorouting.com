"use client"

import type { Dataset } from "@/api/lib/db/schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export function ContributeSuccessStep({
  dataset,
  onReset,
}: { dataset: Dataset; onReset: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Dataset Processed Successfully
        </CardTitle>
        <CardDescription>
          Your dataset has been processed and is now available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Thank you for contributing to the autorouting dataset! Your
          contribution will help improve PCB autorouting for everyone.
        </p>
        <div className="flex gap-2">
          <Link href={`/datasets/${dataset.dataset_name_with_owner}`}>
            <Button variant="outline">View Dataset</Button>
          </Link>
          <Link href="/datasets">
            <Button variant="outline">View All Datasets</Button>
          </Link>
          <Link href="/contribute">
            <Button variant="outline" onClick={onReset}>
              Contribute Another
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
